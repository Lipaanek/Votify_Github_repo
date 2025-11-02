"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEmailDB = initializeEmailDB;
exports.generateVerificationCode = generateVerificationCode;
exports.saveVerificationCode = saveVerificationCode;
exports.deleteVerificationCode = deleteVerificationCode;
exports.incrementAttempt = incrementAttempt;
exports.getAttempts = getAttempts;
exports.validateCode = validateCode;
exports.isTimeUpForCode = isTimeUpForCode;
exports.getVerificationCode = getVerificationCode;
exports.sendVerificationMail = sendVerificationMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const lowdb_1 = require("lowdb");
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const filePath = path_1.default.resolve(__dirname, "../models/email_codes.json");
const adapter = new node_1.JSONFile(filePath);
let db;
async function initializeEmailDB() {
    const defaultData = { code: [] };
    db = new lowdb_1.Low(adapter, defaultData);
    await db.read();
    db.data || (db.data = defaultData);
    await db.write();
}
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function saveVerificationCode(email, code) {
    if (!db) {
        await initializeEmailDB();
    }
    await db.read();
    db.data || (db.data = { code: [] });
    /** Kód vydrží 15 minut */
    db.data.code.push({ email, code, expiresAt: Date.now() + 15 * 60 * 1000, attempts: 3, alreadyAttempted: 0 });
    await db.write();
    console.log(`Saved verification code for ${email}`);
}
async function deleteVerificationCode(email) {
    if (!db) {
        await initializeEmailDB();
    }
    await db.read();
    db.data || (db.data = { code: [] });
    db.data.code = db.data.code.filter((entry) => entry.email !== email);
    await db.write();
    console.log(`Deleted verification code for ${email}`);
}
async function incrementAttempt(email) {
    if (!db) {
        await initializeEmailDB();
    }
    await db.read();
    db.data || (db.data = { code: [] });
    const record = db.data.code.find((entry) => entry.email === email);
    if (record) {
        record.alreadyAttempted += 1;
        await db.write();
        console.log(`Incremented attempt for ${email}`);
    }
}
async function getAttempts(email) {
    if (!db) {
        await initializeEmailDB();
    }
    await db.read();
    db.data || (db.data = { code: [] });
    const record = db.data.code.find((entry) => entry.email === email);
    if (record) {
        return record.alreadyAttempted;
    }
    return null;
}
async function validateCode(email, code) {
    if (!db) {
        await initializeEmailDB();
    }
    if (await isTimeUpForCode(email)) {
        await deleteVerificationCode(email);
        return false;
    }
    await db.read();
    db.data || (db.data = { code: [] });
    const record = db.data.code.find((entry) => entry.email === email);
    if (record) {
        if (record.code === code && record.expiresAt > Date.now() && record.attempts > 0) {
            console.log(`Code for ${email} is valid.`);
            await deleteVerificationCode(email);
            return true;
        }
        else {
            record.attempts -= 1;
            await db.write();
            return false;
        }
    }
    return false;
}
async function isTimeUpForCode(email) {
    if (!db) {
        await initializeEmailDB();
    }
    await db.read();
    db.data || (db.data = { code: [] });
    const record = db.data.code.find((entry) => entry.email === email);
    if (record) {
        return record.expiresAt <= Date.now();
    }
    return true;
}
async function getVerificationCode(email) {
    if (!db) {
        await initializeEmailDB();
    }
    await db.read();
    db.data || (db.data = { code: [] });
    const record = db.data.code.find((entry) => entry.email === email);
    if (record) {
        return record.code;
    }
    return null;
}
async function sendVerificationMail(email) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const VERIFICATION_CODE = generateVerificationCode();
        const info = await transporter.sendMail({
            from: `"VoxPlatform Verification Email" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verification Code",
            text: `
            Use the code below to complete your login to Vox:
                      ${VERIFICATION_CODE}
            This code will expire in 15 minutes.
            If you did not request this code, please ignore this email.`,
        });
        console.log("Email sent:", info.response);
        await saveVerificationCode(email, VERIFICATION_CODE);
    }
    catch (error) {
        console.error("Error sending email:", error);
        // Fallback: log the code to console for testing
        const VERIFICATION_CODE = generateVerificationCode();
        console.log(`\n=== VERIFICATION CODE FOR ${email} ===`);
        console.log(`Code: ${VERIFICATION_CODE}`);
        console.log(`This code will expire in 15 minutes.`);
        console.log(`=====================================\n`);
        await saveVerificationCode(email, VERIFICATION_CODE);
    }
}
