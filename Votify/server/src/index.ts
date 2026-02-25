/**
 * Tento soubor obsahuje hlavní vstupní bod serverové aplikace VoxPlatform.
 * Nastavuje a spouští Express server, který naslouchá na port
 * @module VoxPlatformServer
 * @packageDocumentation
 */

import path from 'path';
import fs from 'fs';
import https from 'https';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import apiRoutes from "./routes/routes";
import express, { Express } from "express";

import { initializeEmailDB } from './auth';
import { initializeCookiesDB } from './cookies';

export * from "./types/Data";
export * from "./auth";
export * from "./cookies";
export * from "./models/db";
export * from "./routes/routes";

/**
 * Hlavní vstupní bod serverové aplikace.
 * Nastavuje a spouští Express server.
 */
const app: Express = express();

/**
 * Možnosti pro HTTPS certifikát
 */
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/voxplatform.fit.vutbr.cz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/voxplatform.fit.vutbr.cz/fullchain.pem')
};

initializeEmailDB();
initializeCookiesDB();
/**
 * Middleware pro zpracování JSON těla požadavků a CORS.
 * Používá se pro povolení požadavků z klientské aplikace běžící na jiném portu.
 */
app.use(cors({ origin: ['http://voxplatform.fit.vutbr.cz', 'http://voxplatform.fit.vutbr.cz:3000'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

/**
 * Middleware pro zpracování HTTP požadavků na API.
 */
app.use("/", apiRoutes);

const frontendPath = path.join(__dirname, '../frontend/');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});



/**
 * Spuštění HTTPS serveru na portu 3000.
 */
https.createServer(options, app).listen(3000, '0.0.0.0', () => {
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

