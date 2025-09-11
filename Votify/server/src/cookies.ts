import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { CookiesData } from "./types/Data";

const filePath = path.resolve(__dirname, "../db/cookies.json");
const adapter = new JSONFile<CookiesData>(filePath);
let db: Low<CookiesData>;

export async function initializeCookiesDB(): Promise<void> {
  const defaultData: CookiesData = { cookies: [] };
  db = new Low<CookiesData>(adapter, defaultData);

  await db.read();

  db.data ||= defaultData;

  await db.write();
}

export function generateCookie(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function saveCookie(email: string, cookie: string) {
  if (!db) await initializeCookiesDB();

  await db.read();
  db.data ||= { cookies: [] };

  db.data.cookies = db.data.cookies.filter(c => c.email !== email);

  db.data.cookies.push({ email, cookie, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }); // 24 hours
  await db.write();
  console.log(`Saved cookie for ${email}`);
}

export async function getCookieByEmail(email: string): Promise<string | null> {
  if (!db) await initializeCookiesDB();

  await db.read();
  db.data ||= { cookies: [] };
  const record = db.data.cookies.find(c => c.email === email);
  if (record && record.expiresAt > Date.now()) {
    return record.cookie;
  }
  return null;
}

export async function validateCookie(cookie: string): Promise<string | null> {
  if (!db) await initializeCookiesDB();

  await db.read();
  db.data ||= { cookies: [] };
  const record = db.data.cookies.find(c => c.cookie === cookie && c.expiresAt > Date.now());
  if (record) {
    return record.email;
  }
  return null;
}