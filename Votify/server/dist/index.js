"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataManager_1 = require("./db/DataManager");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const modelsFolder = path_1.default.resolve(__dirname, '../models');
if (!fs_1.default.existsSync(modelsFolder)) {
    fs_1.default.mkdirSync(modelsFolder, { recursive: true });
}
function testDataManager() {
    const dbPath = path_1.default.resolve(__dirname, '../models/votify_data.db');
    const dm = new DataManager_1.DataManager(dbPath);
    let userId = dm.createUser({
        email: "test@gmail.com",
        is_admin: false,
        created_at: new Date,
    });
    console.log(userId);
    let user = dm.getUserById(userId);
    console.log(user);
}
testDataManager();
