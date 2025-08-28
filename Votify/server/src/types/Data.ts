/* #region roleEnum */
/** Definice možných rolí uživatelů */
export type roleEnum = "admin" | "member"; 
/* #endregion roleEnum */

/** #region DataTypesDatabase */
export type User = {
    /** Unikátní ID uživatele */
    id: number;
    /** Jméno uživatele, není vyžadováno */
    name?: string;
    /** Email, podle kterého se uživatel registruje */
    email: string; 
}

export type Group = {
    /** Unikátní ID skupiny */
    id: number;

    /** Název skupiny */
    name: string; 
    /** 
    * Popis skupiny
    *  
    * Může obsahovat HTML, ale doporučuje se používat pouze text 
    */
    description: string;

    /** Datum posledního použití ve formátu ISO 8601 */
    last_use: string;
}

export type UserGroup = {
    /** ID uživatele
     *  @see {@link User.id} 
    */
    userId: number;

    /** ID skupiny*
     * @see {@link Group.id} pro strukturu skupiny
     */
    groupId: number;

    /** Role může být "admin" nebo "member"
     * @see {@link roleEnum} pro definici rolí uživatelů
     */
    role: roleEnum;
}
/** #regionend DataTypesDatabase */

/** #region data */
/** Definuje jaké datatypy budou v databázi (tabulky) */
export type Data = {
    /** Tabulka s registrovanými uživateli
     * Každý uživatel má unikátní ID, jméno a email
     * @see {@link User} pro strukturu uživatele
     */
    users: User[];

    /** 
     * Tabulka s uživatelskými skupinami 
     * Každá skupina má unikátní ID, název, popis a datum posledního použití
     * @see {@link Group} pro strukturu skupiny
     */
    groups: Group[];

    /** Tabulka s uživatelskými skupinami a jejich rolemi
     * Každý záznam obsahuje ID uživatele, ID skupiny a roli uživatele ve skupině
     * @see {@link roleEnum} pro definici rolí uživatelů
     * @see {@link User} pro strukturu uživatele
     */
    userGroups: UserGroup[];
};
/** #endregion data */

/** Definuje strukturu ověřovacího kódu pro emailovou verifikaci */
export type Code = {
    email: string;
    /** 
     * Ověřovací kód 
     * 
     * Generován tímhle algoritmem:
     * 
     * ```typescript
     * Math.floor(100000 + Math.random() * 900000).toString();
     * ```
     * */
    code: string;
    /** Timestamp vypršení platnosti kódu */
    expiresAt: number; 
    /** Počet pokusů o ověření kódu */
    attempts: number; 
    /** Počet pokusů, které uživatel již zadal */
    alreadyAttempted: number; 
}

/** Datová struktura, která definuje ověřovací kódy */
export type VerificationCode = {
    code : Code[];
}