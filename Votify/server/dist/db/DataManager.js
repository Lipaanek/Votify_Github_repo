"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class DataManager {
    constructor(pathInput) {
        this.db = new better_sqlite3_1.default(pathInput);
        this.db.pragma('foreign_keys = ON');
        this.loadSchemaFromFile(path_1.default.resolve(__dirname, '../../models/Votify SQL.session.sql'));
    }
    loadSchemaFromFile(relativePath) {
        const absolutePath = path_1.default.resolve(__dirname, relativePath);
        const sql = fs_1.default.readFileSync(absolutePath, 'utf-8');
        this.db.exec(sql);
    }
    createUser(user) {
        const stmt = this.db.prepare(`
            INSERT INTO users (email, is_admin, created_at)
            VALUES (?, ?, ?)
            `);
        const info = stmt.run(user.email, user.is_admin, user.created_at.toISOString() || new Date().toISOString());
        return info.lastInsertRowid;
    }
    getUserById(userId) {
        const stmt = this.db.prepare(`
            SELECT * FROM users WHERE id = ?
            `);
        return stmt.get(userId);
    }
    createGroup(groupName) {
        const stmt = this.db.prepare(`
            INSERT INTO groups (name, created_at, deleted_at, join_code)
            VALUES (?, ?, ?, ?)
            `);
        const info = stmt.run(groupName, new Date().toISOString(), null, (0, crypto_1.randomBytes)(6).toString('hex'));
        return info.lastInsertRowid;
    }
    getGroupById(groupId) {
        const stmt = this.db.prepare(`
            SELECT * FROM groups WHERE id = ?
            `);
        return stmt.get(groupId);
    }
    addUserToGroup(groupId, userId) {
        const stmt = this.db.prepare(`
            INSERT INTO group_members (user_id, group_id, joined_at)
            VALUES (?, ?, ?)
            `);
        const info = stmt.run(userId, groupId, new Date().toISOString());
        return info.lastInsertRowid;
    }
    getUsersInGroup(groupId) {
        const stmt = this.db.prepare(`
            SELECT u.*
            FROM users u
            JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = ?;
            `);
        return stmt.all(groupId);
    }
}
exports.DataManager = DataManager;
