import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

/* #region roleEnum */
/** Definice možných rolí uživatelů */
export type roleEnum = "admin" | "member"; 
/* #endregion roleEnum */

/** #region data */
/** Definuje jaké datatypy budou v databázi (tabulky) */
export type Data = {
    /** Tabulka s registrovanými uživateli */
    users: {
        /** Unikátní ID uživatele */ 
        id: number;
        /** Jméno uživatele, není vyžadováno */
        name?: string;
        /** Email, podle kterého se uživatel registruje */
        email: string; 
    }[];
    /** Tabulka s uživatelskými skupinami */
    /** Každá skupina má unikátní ID, název, popis a datum posledního použití */
    groups: {
        /** ID skupiny */ 
        id: number;
        /** Název skupiny */
        name: string; 
        /** 
         * Popis skupiny
         *  
         * Může obsahovat HTML, ale doporučuje se používat pouze text 
         */
        description: string;
        /** ISO 8601 date string */
        last_use: string; 
    }[];

    /** Tabulka s uživatelskými skupinami a jejich rolemi */
    /** Každý záznam obsahuje ID uživatele, ID skupiny a roli uživatele ve skupině */
    
    userGroups: {
        /** ID uživatele, {@link users} */
        userId: number;
        /** ID skupiny, {@link groups} */
        groupId: number;
        /** Role může být "admin" nebo "member" {@link roleEnum}  */
        role: roleEnum;
    }[];
};
/* #endregion data */

const filePath = path.resolve(__dirname, "../data/db.json");
const adapter = new JSONFile<Data>(filePath);

export function createDatabase() {
    const defaultData: Data = {
        users: [],
        groups: [],
        userGroups: [],};

    /* Inicializace LowDB s JSON souborem a výchozími daty */
    /* Pokud soubor neexistuje, vytvoří se s výchozími daty */
    /* @see {@link Data} pro strukturu dat */
    /* @see {@link roleEnum} pro definici rolí uživatelů */
    const db = new Low<Data>(adapter, defaultData);
    db.data ||= { users: [], groups: [], userGroups: [] }; // Inicializace databáze, pokud neexistuje
    return db;
}