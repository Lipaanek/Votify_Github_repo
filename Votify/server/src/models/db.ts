import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

import { Data, User } from "../types/Data";


const filePath = path.resolve(__dirname, "../data/db.json");
const adapter = new JSONFile<Data>(filePath);

/**
 * Třída pro správu databáze pomocí LowDB.
 */
export class Databse {
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
        await this.db.read();
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

    public async addUSer(userData : User) : Promise<void> {   
    }
}


