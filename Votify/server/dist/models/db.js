"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
/**
 * @module DB
 */
const lowdb_1 = require("lowdb");
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const console_1 = require("console");
dotenv_1.default.config();
const filePath = path_1.default.resolve(__dirname, "data.json");
const adapter = new node_1.JSONFile(filePath);
/**
 * Třída pro správu databáze pomocí LowDB.
 */
class Database {
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
        const defaultData = {
            users: [],
            groups: [],
            userGroups: [],
        };
        this.db = new lowdb_1.Low(adapter, defaultData);
    }
    /**
     * Inicializuje databázi, načte data a nastaví výchozí hodnoty, pokud nejsou přítomny.
     * [!NOTE] Tato metoda by měla být volána před jakýmkoliv použitím databáze.
     * @returns {Promise<void>} Promise, která se vyřeší po načtení dat.
     */
    async init() {
        var _a;
        try {
            await this.db.read();
        }
        catch (err) {
            console.warn("Database file is empty or invalid, initializing with defaults");
            this.db.data = { users: [], groups: [], userGroups: [] };
            await this.db.write();
        }
        (_a = this.db).data || (_a.data = { users: [], groups: [], userGroups: [] });
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
    getData() {
        return this.db.data;
    }
    /**
     * Přidá uživatele do databáze
     * @param userData data uživatele, @see {@link User}
     *
     * @example
     * ```typescript
     * const user = { email: 'example@gmail.com'; name: ''; };
     *
     * db.addUser(user);
     * ```
     */
    async addUser(userData) {
        (0, console_1.assert)(this.db, "Database not initialized");
        (0, console_1.assert)(userData, "No user data provided");
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
     *
     * const result = db.doesUserExist(email); // True | False
     */
    async doesUserExist(email) {
        (0, console_1.assert)(this.db.data, "Database not initialized");
        return this.db.data.users.some(user => user.email === email);
    }
    /**
     * Získá veskeré info pro daného uživatele
     * @param email email uživatele
     * @returns InfoRequest nebo null, @see {@link InfoRequest}
     */
    async getUserInfo(email) {
        (0, console_1.assert)(this.db.data, "Database not initialized");
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
     *
     * const groupId = db.addGroup(groupData);
     * ```
     */
    async addGroup(groupData) {
        (0, console_1.assert)(this.db, "Database not initialized");
        (0, console_1.assert)(groupData, "No group data provided");
        const newId = this.db.data.groups.length > 0 ? Math.max(...this.db.data.groups.map(g => g.id)) + 1 : 1;
        const group = { id: newId, polls: [], ...groupData };
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
     *
     * const role = "admin";
     *
     * db.addUserToGroup(email, groupId, role);
     * ```
     */
    async addUserToGroup(email, groupId, role) {
        (0, console_1.assert)(this.db, "Database not initialized");
        (0, console_1.assert)(email, "No email provided");
        (0, console_1.assert)(groupId, "No groupId provided");
        this.db.data.userGroups.push({ userEmail: email, groupId: groupId, role: role });
        await this.db.write();
    }
    /**
     * Přidá hlasování do určité skupiny
     * @param poll data hlasování, @see {@link Poll}
     * @param groupId unikátní ID skupiny, kde přidat hlasování
     * @returns number, unikátní id hlasování
     *
     * @example
     * ```typescript
     * const pollData = { votes: 0, end: "2025-10-14T15:43:11.092Z", title: "Test Poll" };
     * const groupId = 1 // příklad ID skupiny
     *
     * const pollId = db.addPollToGroup(pollData, groupId);
     * ```
     */
    async addPollToGroup(poll, groupId) {
        (0, console_1.assert)(this.db, "Database not initialized");
        (0, console_1.assert)(poll, "Poll does not exist");
        (0, console_1.assert)(groupId, "GroupId does not exist");
        const allPolls = this.db.data.groups.flatMap(g => g.polls);
        const newId = allPolls.length > 0 ? Math.max(...allPolls.map(p => p.id)) + 1 : 1;
        const pollFinal = { id: newId, options: [], alreadyVoted: [], ...poll };
        const group = this.db.data.groups.find(group => group.id === groupId);
        if (!group || !pollFinal) {
            (0, console_1.assert)(group, "Group or poll does not exist");
        }
        group?.polls.push(pollFinal);
        await this.db.write();
        return newId;
    }
    /**
     * Získá hlasování podle ID
     * @param pollId unikátní ID hlasování
     * @returns Poll nebo null
     */
    async getPollById(pollId) {
        (0, console_1.assert)(this.db, "Database not initialized");
        for (const group of this.db.data.groups) {
            const poll = group.polls.find(p => p.id === pollId);
            if (poll) {
                return poll;
            }
        }
        return null;
    }
    /**
     * Přidá možnost do hlasování
     * @param pollId unikátní ID hlasování
     * @param option možnost k přidání
     */
    async addOptionToPoll(pollId, option) {
        (0, console_1.assert)(this.db, "Database not initialized");
        for (const group of this.db.data.groups) {
            const poll = group.polls.find(p => p.id === pollId);
            if (poll) {
                const existingOptions = poll.options.filter(p => p.optionName === option.optionName);
                if (existingOptions.length > 0) {
                    return;
                }
                poll.options.push({ ...option, votes: 0 });
                await this.db.write();
                return;
            }
        }
        throw new Error("Poll not found");
    }
    /**
     * Získá všechna hlasování pro uživatele s názvem skupiny
     * @param email email uživatele
     * @returns Pole hlasování s názvem skupiny
     */
    async getPollsForUser(email) {
        (0, console_1.assert)(this.db, "Database not initialized");
        const userGroups = this.db.data.userGroups.filter(ug => ug.userEmail === email);
        const pollsWithGroup = [];
        for (const ug of userGroups) {
            const group = this.db.data.groups.find(g => g.id === ug.groupId);
            if (group) {
                for (const poll of group.polls) {
                    pollsWithGroup.push({ poll, groupName: group.name });
                }
            }
        }
        return pollsWithGroup;
    }
    /**
     * Zaregistruje volbu uživatele
     * @param email email uživatele
     * @param pollId unikátní id hlasování, @see {@link Poll}
     * @param optionName unikátní jméno určitého
     * @returns void
     */
    async addVoteToPollOption(email, pollId, optionName) {
        (0, console_1.assert)(this.db.data, "Database not initialized");
        let targetGroup = null;
        for (const group of this.db.data.groups) {
            const poll = group.polls.find(p => p.id === pollId);
            if (poll) {
                targetGroup = group;
                break;
            }
        }
        if (!targetGroup) {
            return;
        }
        const userGroup = this.db.data.userGroups.find(ug => ug.userEmail === email && ug.groupId === targetGroup.id);
        if (!userGroup) {
            return;
        }
        const poll = targetGroup.polls.find(p => p.id === pollId);
        if (!poll) {
            return;
        }
        if (new Date(poll.end) <= new Date()) {
            return;
        }
        if (poll.alreadyVoted.includes(email)) {
            return;
        }
        const option = poll.options.find(o => o.optionName === optionName);
        if (!option) {
            return;
        }
        poll.alreadyVoted.push(email);
        option.votes += 1;
        poll.votes += 1;
        await this.db.write();
    }
    /**
     * Získá všechna hlasování pro skupinu
     * @param groupId ID skupiny
     * @returns Pole hlasování
     */
    async getPollsForGroup(groupId) {
        (0, console_1.assert)(this.db, "Database not initialized");
        const group = this.db.data.groups.find(g => g.id === groupId);
        return group ? group.polls : [];
    }
    /**
     * Funkce získá informace o dané skupině
     * @param groupId ID skupiny
     * @returns informace o skupině nebo null
     */
    async getGroupInfo(groupId) {
        (0, console_1.assert)(this.db.data, "Database not initialized");
        const group = this.db.data.groups.find(g => g.id === groupId);
        if (!group)
            return null;
        const members = this.db.data.userGroups.filter(ug => ug.groupId === groupId).length;
        return { id: group.id, name: group.name, description: group.description, members };
    }
    /**
     * Získá "veřejná" data o skupině
     * @param groupId ID skupiny
     * @returns informace o skupině, které mohou být veřejně exposed
     */
    async getGroupPublicInfo(groupId) {
        (0, console_1.assert)(this.db.data, "Database not initialized");
        const group = this.db.data.groups.find(g => g.id === groupId);
        if (!group)
            return null;
        return { id: group.id, name: group.name, description: group.description };
    }
    async sendPollResultsEmail(adminEmail, poll, groupName) {
        console.log(`Attempting to send poll results email to ${adminEmail} for poll "${poll.title}" in group "${groupName}"`);
        console.log(`MAIL_USER: ${process.env.MAIL_USER ? 'SET' : 'NOT SET'}`);
        console.log(`MAIL_PASS: ${process.env.MAIL_PASS ? 'SET' : 'NOT SET'}`);
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
            let resultsText = `Poll "${poll.title}" in group "${groupName}" has ended.\n\nResults:\n`;
            for (const option of poll.options) {
                resultsText += `${option.optionName}: ${option.votes} votes\n`;
            }
            resultsText += `\nTotal votes: ${poll.votes}`;
            console.log(`Sending email with subject: Poll Results: ${poll.title}`);
            console.log(`Email body length: ${resultsText.length} characters`);
            const info = await transporter.sendMail({
                from: `"VoxPlatform Poll Results" <${process.env.MAIL_USER}>`,
                to: adminEmail,
                subject: `Poll Results: ${poll.title}`,
                text: resultsText,
            });
            console.log("Poll results email sent successfully:", info.response);
        }
        catch (error) {
            console.error("Error sending poll results email:", error);
            console.error("Error details:", error instanceof Error ? error.message : String(error));
            console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
        }
    }
    /**
     * Funkce projde veškerá hlasování a porovná datum ukončení s nýnějším časem
     */
    async checkPollDates() {
        (0, console_1.assert)(this.db.data, "Database not initialized");
        const now = new Date();
        console.log(`Checking for expired polls at ${now.toISOString()}`);
        for (const group of this.db.data.groups) {
            console.log(`Checking group "${group.name}" (ID: ${group.id}) with ${group.polls.length} polls`);
            for (let i = group.polls.length - 1; i >= 0; i--) {
                const poll = group.polls[i];
                const pollEndDate = new Date(poll.end);
                console.log(`Poll "${poll.title}" (ID: ${poll.id}) ends at ${pollEndDate.toISOString()}, now is ${now.toISOString()}`);
                if (pollEndDate <= now) {
                    console.log(`Poll "${poll.title}" has expired, sending results emails`);
                    const admins = this.db.data.userGroups.filter(ug => ug.groupId === group.id && ug.role === "admin");
                    console.log(`Found ${admins.length} admins for group "${group.name}": ${admins.map(a => a.userEmail).join(', ')}`);
                    for (const admin of admins) {
                        await this.sendPollResultsEmail(admin.userEmail, poll, group.name);
                    }
                    console.log(`Removing expired poll "${poll.title}" from group "${group.name}"`);
                    group.polls.splice(i, 1);
                }
            }
        }
        await this.db.write();
        console.log("Poll date check completed");
    }
    isReady() {
        return !!this.db.data;
    }
    /**
     * Funkce začne s periodickou kontrolou datumů ukončení
     * @param intervalMs interval opakování v milisekundách, default 60 000
     */
    startPollChecker(intervalMs = 60000) {
        setInterval(async () => {
            try {
                await this.checkPollDates();
            }
            catch (error) {
                console.error("Error in poll checker:", error);
            }
        }, intervalMs);
    }
}
exports.Database = Database;
