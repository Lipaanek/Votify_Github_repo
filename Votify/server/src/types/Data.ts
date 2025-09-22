/* #region roleEnum */
/** Definice možných rolí uživatelů */
export type roleEnum = "admin" | "member"; 
/* #endregion roleEnum */

/** #region DataTypesDatabase */
export type User = {
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
    /**
     * Aktivní hlasování
     * @see {@link Poll} pro definici hlasování
     */
    polls: Poll[];
}

export type UserGroup = {
    /** Email uživatele
     *  @see {@link User.email} 
    */
    userEmail: string;

    /** ID skupiny*
     * @see {@link Group.id} pro strukturu skupiny
     */
    groupId: number;

    /** Role může být "admin" nebo "member"
     * @see {@link roleEnum} pro definici rolí uživatelů
     */
    role: roleEnum;
}

/**
 * Definuje možnost volby
 */
export type Option = {
    /**
     * Název možnosti
     */
    optionName: string;
    /**
     * Kolik hlasů má možnost
     */
    votes: number;
    /**
     * Popis možnosti, dobrovolné
     */
    optionDescription?: string;
}

/**
 * Definuje hlasování
 */
export type Poll = {
    /**
     * Unikátní ID hlasování
     */
    id: number;
    /**
     * Už zadané hlasy
     */
    votes: number;
    /**
     * Možnosti, pro které mohou uživatelé volit
     * @see {@link Option} pro definici možností
     */
    options: Option[];
    /**
     * List emailů, které daly hlas
     */
    alreadyVoted: string[];
    /**
     * Čas, kdy hlasování končí
     */
    end: string;
    title: string;
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
    /**
     * Seznam ověřovacích kódů pro emailovou verifikaci
     * 
     * @see {@link Code} pro strukturu ověřovacího kódu
     */
    code : Code[];
}

/** Definuje strukturu cookie pro autentifikaci */
export type Cookie = {
    email: string;
    /** Nahodný string, pro session id, aka cookie */
    cookie: string;
    /** Timestamp vypršení platnosti cookie */
    expiresAt: number;
}

/** Datová struktura pro cookies */
export type CookiesData = {
    /**
     * Seznam cookies pro autentifikaci uživatelů
     * 
     * @see {@link Cookie} pro strukturu cookie
     */
    cookies: Cookie[];
}

/** Definuje strukturu odpovědi na /api/info */
export type InfoRequest = { 
    /**
     * Seznam skupin, do kterých uživatel patří
     * 
     * @see {@link Group} pro strukturu skupiny
     */
    userGroups: Group[];
}