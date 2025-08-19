
import path from 'path';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
 
const modelsFolder = path.resolve(__dirname, '../models');

if (!fs.existsSync(modelsFolder)) {
    fs.mkdirSync(modelsFolder, { recursive: true });
}

export function testDataManager() {
    const dbPath = path.resolve(__dirname, '../models/votify_data.db');
}

testDataManager();
