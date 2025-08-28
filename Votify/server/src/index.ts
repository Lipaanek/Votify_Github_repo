/**
 * Tento soubor obsahuje hlavní vstupní bod serverové aplikace Votify.
 * Nastavuje a spouští Express server, který naslouchá na port
 * @module VotifyServer
 * @packageDocumentation
 */

import path from 'path';
import fs from 'fs';

import cors from 'cors';

import apiRoutes from "./routes/routes";
import express, { Express } from "express";

import { initializeEmailDB } from './auth';
/**
 * Hlavní vstupní bod serverové aplikace.
 * Nastavuje a spouští Express server.
 */
const app: Express = express();
initializeEmailDB();
/**
 * Middleware pro zpracování JSON těla požadavků a CORS.
 * Používá se pro povolení požadavků z klientské aplikace běžící na jiném portu.
 */
app.use(cors({ origin: 'http://localhost:5000' }));

/**
 * Middleware pro zpracování HTTP požadavků na API.
 */
app.use("/", apiRoutes);

/**
 * Spuštění serveru na portu 3000.
 * Po spuštění vypíše do konzole informaci o běhu serveru.
 */
app.listen(3000, () => {
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

