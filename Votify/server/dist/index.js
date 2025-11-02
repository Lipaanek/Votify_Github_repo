"use strict";
/**
 * Tento soubor obsahuje hlavní vstupní bod serverové aplikace Votify.
 * Nastavuje a spouští Express server, který naslouchá na port
 * @module VotifyServer
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes/routes"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const cookies_1 = require("./cookies");
/**
 * Hlavní vstupní bod serverové aplikace.
 * Nastavuje a spouští Express server.
 */
const app = (0, express_1.default)();
(0, auth_1.initializeEmailDB)();
(0, cookies_1.initializeCookiesDB)();
/**
 * Middleware pro zpracování JSON těla požadavků a CORS.
 * Používá se pro povolení požadavků z klientské aplikace běžící na jiném portu.
 */
app.use((0, cors_1.default)({ origin: ['http://voxplatform.fit.vutbr.cz'], credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
/**
 * Middleware pro zpracování HTTP požadavků na API.
 */
app.use("/", routes_1.default);
const frontendPath = path_1.default.join(__dirname, '../frontend');
app.use(express_1.default.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
/**
 * Spuštění serveru na portu 3000.
 * Po spuštění vypíše do konzole informaci o běhu serveru.
 */
app.listen(3000, '0.0.0.0', () => {
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
