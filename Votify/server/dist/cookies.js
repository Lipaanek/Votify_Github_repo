"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCookiesDB = initializeCookiesDB;
exports.generateCookie = generateCookie;
exports.saveCookie = saveCookie;
exports.getCookieByEmail = getCookieByEmail;
exports.validateCookie = validateCookie;
const lowdb_1 = require("lowdb");
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.resolve(__dirname, "../db/cookies.json");
const adapter = new node_1.JSONFile(filePath);
let db;
async function initializeCookiesDB() {
    const defaultData = { cookies: [] };
    db = new lowdb_1.Low(adapter, defaultData);
    await db.read();
    db.data || (db.data = defaultData);
    await db.write();
}
function generateCookie() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
async function saveCookie(email, cookie) {
    if (!db)
        await initializeCookiesDB();
    if (!db)
        throw new Error('Database not initialized');
    await db.read();
    db.data || (db.data = { cookies: [] });
    db.data.cookies = db.data.cookies.filter((c) => c.email !== email);
    db.data.cookies.push({ email, cookie, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }); // 24 hours
    await db.write();
    console.log(`Saved cookie for ${email}`);
}
async function getCookieByEmail(email) {
    if (!db)
        await initializeCookiesDB();
    if (!db)
        throw new Error('Database not initialized');
    await db.read();
    db.data || (db.data = { cookies: [] });
    const record = db.data.cookies.find((c) => c.email === email);
    if (record && record.expiresAt > Date.now()) {
        return record.cookie;
    }
    return null;
}
async function validateCookie(cookie) {
    if (!db)
        await initializeCookiesDB();
    if (!db)
        throw new Error('Database not initialized');
    await db.read();
    db.data || (db.data = { cookies: [] });
    const record = db.data.cookies.find((c) => c.cookie === cookie && c.expiresAt > Date.now());
    if (record) {
        return record.email;
    }
    return null;
}
