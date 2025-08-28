import nodemailer from "nodemailer";
import dotenv from "dotenv";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
// Update the import path to the correct relative location, for example:
// If the file exists, ensure it exports VerificationCode:
import { VerificationCode } from "../src/types/Data";

dotenv.config();


const filePath = path.resolve(__dirname, "../models/email_codes.json");
const adapter = new JSONFile<VerificationCode>(filePath);
let db : Low<VerificationCode>;

export async function initializeEmailDB(): Promise<void> {
  const defaultData: VerificationCode = { code: [] };
  db = new Low<VerificationCode>(adapter, defaultData);

  await db.read();

  db.data ||= defaultData;

  // Write back to create the file if it didn't exist
  await db.write();
}


export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveVerificationCode(email: string, code: string) {
  if (!db) { initializeEmailDB(); }

  await db.read();
  db.data ||= { code: [] };

  /** Kód vydrží 15 minut */
  db.data.code.push({ email, code, expiresAt: Date.now() + 15 * 60 * 1000, attempts: 3, alreadyAttempted: 0 });
  await db.write();
  console.log(`Saved verification code for ${email}`);
}

export async function deleteVerificationCode(email: string) {
  if (!db) { initializeEmailDB(); }

  await db.read();
  db.data ||= { code: [] };
  db.data.code = db.data.code.filter(entry => entry.email !== email);
  await db.write();
  console.log(`Deleted verification code for ${email}`);
}

export async function incrementAttempt(email: string) {
  if (!db) { initializeEmailDB(); }

  await db.read();
  db.data ||= { code: [] };
  const record = db.data.code.find(entry => entry.email === email);
  if (record) {
    record.alreadyAttempted += 1;
    await db.write();
    console.log(`Incremented attempt for ${email}`);
  }
}

export async function getAttempts(email: string): Promise<number | null> {
  if (!db) { initializeEmailDB(); }

  await db.read();
  db.data ||= { code: [] };
  const record = db.data.code.find(entry => entry.email === email);
  if (record) {
    return record.alreadyAttempted;
  }

  return null;
}

export async function validateCode(email: string, code: string): Promise<boolean> {
  if (!db) { initializeEmailDB(); }
  if (await isTimeUpForCode(email)) {
    await deleteVerificationCode(email);
    return false;
  }
  
  await db.read();
  db.data ||= { code: [] };
  const record = db.data.code.find(entry => entry.email === email);
  if (record) {
    if (record.code === code && record.expiresAt > Date.now() && record.attempts > 0) {
      console.log(`Code for ${email} is valid.`);
      await deleteVerificationCode(email);
      return true;
    } else {
      record.attempts -= 1;
      await db.write();
      return false;
    }
  }

  return false;
}

export async function isTimeUpForCode(email: string): Promise<boolean> {
  if (!db) { initializeEmailDB(); }
  await db.read();
  db.data ||= { code: [] };
  const record = db.data.code.find(entry => entry.email === email);
  if (record) {
    return record.expiresAt <= Date.now();
  }
  return true;
}

export async function getVerificationCode(email: string): Promise<string | null> {
  if (!db) { initializeEmailDB(); }

  await db.read();
  db.data ||= { code: [] };
  const record = db.data.code.find(entry => entry.email === email);
  if (record) {
    return record.code;
  }

  return null;
}

export async function sendVerificationMail(email: string) {
  try {
    const transporter = nodemailer.createTransport({
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
            f you did not request this code, please ignore this email.`,
    });

    console.log("Email sent:", info.response);
    await saveVerificationCode(email, VERIFICATION_CODE);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
