"use strict";
/**
 * Tento soubor obsahuje hlavní vstupní bod serverové aplikace VoxPlatform.
 * Nastavuje a spouští Express server, který naslouchá na port
 * @module VoxPlatformServer
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes/routes"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const cookies_1 = require("./cookies");
__exportStar(require("./types/Data"), exports);
__exportStar(require("./auth"), exports);
__exportStar(require("./cookies"), exports);
__exportStar(require("./models/db"), exports);
__exportStar(require("./routes/routes"), exports);
/**
 * Hlavní vstupní bod serverové aplikace.
 * Nastavuje a spouští Express server.
 */
const app = (0, express_1.default)();
/**
 * Možnosti pro HTTPS certifikát
 */
const options = {
    key: fs_1.default.readFileSync('/etc/letsencrypt/live/voxplatform.fit.vutbr.cz/privkey.pem'),
    cert: fs_1.default.readFileSync('/etc/letsencrypt/live/voxplatform.fit.vutbr.cz/fullchain.pem')
};
(0, auth_1.initializeEmailDB)();
(0, cookies_1.initializeCookiesDB)();
/**
 * Middleware pro zpracování JSON těla požadavků a CORS.
 * Používá se pro povolení požadavků z klientské aplikace běžící na jiném portu.
 */
app.use((0, cors_1.default)({ origin: ['http://voxplatform.fit.vutbr.cz', 'http://voxplatform.fit.vutbr.cz:3000'], credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
/**
 * Middleware pro zpracování HTTP požadavků na API.
 */
app.use("/", routes_1.default);
const frontendPath = path_1.default.join(__dirname, '../frontend/');
app.use(express_1.default.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
/**
 * Spuštění HTTPS serveru na portu 3000.
 */
https_1.default.createServer(options, app).listen(3000, '0.0.0.0', () => {
    console.log("Server is running on port 3000");
});
//const modelsFolder = path.resolve(__dirname, '../models');
/*if (!fs.existsSync(modelsFolder)) {
    fs.mkdirSync(modelsFolder, { recursive: true });
}

export function testDataManager() {
    const dbPath = path.resolve(__dirname, '../models/votify_data.db');
}
*/
