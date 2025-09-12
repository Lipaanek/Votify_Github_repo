import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

import { Data, User } from "../types/Data";
import { assert, warn } from "console";


const filePath = path.resolve(__dirname, "data.json");
const adapter = new JSONFile<Data>(filePath);

/**
 * Třída pro správu databáze pomocí LowDB.
 */
export class Database {
    private db: Low<Data>;

    /**
     * Vytvoří a inicializuje databázi pomocí LowDB.
     * [!WARNING] Tato třída by měla být používána jako singleton, aby se zabránilo více instancím.
     * [!NOTE] Před použitím této třídy je nutné zavolat `init()` metodu.
     * @example 
     * ```typescript
     * const db = new Databse();
     * await db.init();
     * const data = db.getData();
     * ```
     */
    constructor() {
        const defaultData: Data = {
            users: [],
            groups: [],
            userGroups: [],
        };

        this.db = new Low<Data>(adapter, defaultData);
    }

    /**
     * Inicializuje databázi, načte data a nastaví výchozí hodnoty, pokud nejsou přítomny.
     * [!NOTE] Tato metoda by měla být volána před jakýmkoliv použitím databáze.
     * @returns {Promise<void>} Promise, která se vyřeší po načtení dat.
     */
    async init() {
        try {
            await this.db.read();
        } catch (err) {
            console.warn("Database file is empty or invalid, initializing with defaults");
            this.db.data = { users: [], groups: [], userGroups: [] };
            await this.db.write();
        }
        this.db.data ||= { users: [], groups: [], userGroups: [] };
    }

    /**
     * Získá aktuální data z databáze.
     * @returns {Data} Aktuální data z databáze.
     * 
     * @example
     * ```typescript
     * const data = db.getData();
     * console.log(data.users);
     * 
     * // Další věci s daty
     * ```
     */
    public getData(): Data {
        return this.db.data!;
    }

    public async addUser(userData : User) : Promise<void> {
        if (!this.db.data) {
            throw new Error("Database not initialized");
        } else if (!userData) {
            warn("No user data provided");
            return;
        }

        this.db.data.users.push(userData);
        await this.db.write();
    }

    public async doesUserExist(email: string) : Promise<boolean> {
        assert(this.db.data, "Database not initialized");
        return this.db.data.users.some(user => user.email === email);
    }
}


