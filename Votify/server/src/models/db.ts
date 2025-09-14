import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

import { Data, User, InfoRequest, Group } from "../types/Data";
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

    /**
     * Přidá uživatele do databáze
     * @param userData data uživatele, @see {@link User}
     * 
     * @example
     * ```typescript
     * const user = { email: 'example@gmail.com'; name: ''; };
     * const db = new Database();
     * 
     * db.addUser(user);
     * ```
     */
    public async addUser(userData : User) : Promise<void> {
        assert(this.db, "Database not initialized");
        assert(userData, "No user data provided");

        this.db.data.users.push(userData);
        await this.db.write();
    }

    /**
     * Zjistí jestli uživatel je již zaregistrován
     * @param email email uživatele
     * @returns boolean
     * 
     * @example
     * ```typescript
     * const email = 'example@gmail.com';
     * const db = new Database();
     * 
     * const result = db.doesUserExist(email); // True | False
     */
    public async doesUserExist(email: string) : Promise<boolean> {
        assert(this.db.data, "Database not initialized");
        return this.db.data.users.some(user => user.email === email);
    }

    /**
     * Získá veskeré info pro daného uživatele
     * @param email email uživatele
     * @returns InfoRequest nebo null, @see {@link InfoRequest}
     */
    public async getUserInfo(email: string) : Promise<InfoRequest | null> {
        assert(this.db.data, "Database not initialized");
        const user = this.db.data.users.find(user => user.email === email);
        if (!user) {
            return null;
        }

        const userGroups = this.db.data.userGroups.filter(ug => ug.userEmail === email);
        if (!userGroups || userGroups.length === 0) {
            return { userGroups: [] };
        }

        const groups = this.db.data.groups.filter(group => userGroups.some(ug => ug.groupId === group.id));
        if (!groups || groups.length === 0) {
            return { userGroups: [] };
        }

        return { userGroups: groups };
    }

    /**
     * Přidá uživatele do databáze
     * @param groupData data uživatele, @see {@link Group}
     * @returns number, unikátní id skupiny
     * 
     * @example
     * ```typescript
     * const groupData = { name: 'Test Group'; description: 'Just testing stuff...'; last_use: '2025-09-14T15:43:11.092Z' };
     * const db = new Database();
     * 
     * const groupId = db.addGroup(groupData);
     * ```
     */
    public async addGroup(groupData: { name: string; description: string; last_use: string }) : Promise<number> {
        assert(this.db, "Database not initialized");
        assert(groupData, "No group data provided");

        const newId = this.db.data.groups.length > 0 ? Math.max(...this.db.data.groups.map(g => g.id)) + 1 : 1;
        const group = { id: newId, ...groupData };
        this.db.data.groups.push(group);
        await this.db.write();
        return newId;
    }

    /**
     * Přidá uživatele do databáze
     * @param email data uživatele, @see {@link User}
     * @returns number, unikátní id skupiny
     * 
     * @example
     * ```typescript
     * const groupData = { name: 'Test Group'; description: 'Just testing stuff...'; last_use: '2025-09-14T15:43:11.092Z' };
     * const email = 'example@gmail.com';
     * const db = new Database();
     * 
     * const role = "admin";
     * 
     * const groupId = db.addGroup(groupData);
     * 
     * db.addUserToGroup(email, groupId, role);
     * ```
     */
    public async addUserToGroup(email: string, groupId: number, role: "admin" | "member") : Promise<void> {
        assert(this.db, "Database not initialized");
        assert(email, "No email provided");
        assert(groupId, "No groupId provided");

        this.db.data.userGroups.push({ userEmail: email, groupId, role });
        await this.db.write();
    }
}


