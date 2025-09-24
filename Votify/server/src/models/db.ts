import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import { Data, User, InfoRequest, Group, Poll } from "../types/Data";
import { assert, warn } from "console";

dotenv.config();


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
     * 
     * const groupId = db.addGroup(groupData);
     * ```
     */
    public async addGroup(groupData: { name: string; description: string; last_use: string }) : Promise<number> {
        assert(this.db, "Database not initialized");
        assert(groupData, "No group data provided");

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
    public async addUserToGroup(email: string, groupId: number, role: "admin" | "member") : Promise<void> {
        assert(this.db, "Database not initialized");
        assert(email, "No email provided");
        assert(groupId, "No groupId provided");

        this.db.data.userGroups.push({ userEmail: email, groupId: groupId, role: role});
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
    public async addPollToGroup(poll : {votes: number, end: string, title: string}, groupId : number) : Promise<number> {
        assert(this.db, "Database not initialized");
        assert(poll, "Poll does not exist");
        assert(groupId, "GroupId does not exist");

        const allPolls = this.db.data.groups.flatMap(g => g.polls);
        const newId = allPolls.length > 0 ? Math.max(...allPolls.map(p => p.id)) + 1 : 1;
        const pollFinal = {id: newId, options: [], alreadyVoted: [], ...poll} as Poll;
        const group = this.db.data.groups.find(group => group.id === groupId);
        if(!group || !pollFinal) { assert(group, "Group or poll does not exist"); }

        group?.polls.push(pollFinal);
        await this.db.write();
        return newId;
    }

    /**
     * Získá hlasování podle ID
     * @param pollId unikátní ID hlasování
     * @returns Poll nebo null
     */
    public async getPollById(pollId: number): Promise<Poll | null> {
        assert(this.db, "Database not initialized");
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
    public async addOptionToPoll(pollId: number, option: { optionName: string; optionDescription?: string }): Promise<void> {
        assert(this.db, "Database not initialized");
        for (const group of this.db.data.groups) {
            const poll = group.polls.find(p => p.id === pollId);
            if (poll) {
                const existingOptions = poll.options.filter(p => p.optionName === option.optionName)
                if(existingOptions.length > 0) { return; }

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
    public async getPollsForUser(email: string): Promise<{ poll: Poll; groupName: string }[]> {
        assert(this.db, "Database not initialized");
        const userGroups = this.db.data.userGroups.filter(ug => ug.userEmail === email);
        const pollsWithGroup: { poll: Poll; groupName: string }[] = [];
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
    public async addVoteToPollOption(email: string, pollId: number, optionName: string): Promise<void> {
        assert(this.db.data, "Database not initialized");

        // Find the group containing this poll
        let targetGroup = null;
        for (const group of this.db.data.groups) {
            const poll = group.polls.find(p => p.id === pollId);
            if (poll) {
                targetGroup = group;
                break;
            }
        }
        if (!targetGroup) { return; }

        // Check if user is in this group
        const userGroup = this.db.data.userGroups.find(ug => ug.userEmail === email && ug.groupId === targetGroup.id);
        if (!userGroup) { return; }

        const poll = targetGroup.polls.find(p => p.id === pollId);
        if (!poll) { return; }

        // Check if poll has ended
        if (new Date(poll.end) <= new Date()) { return; }

        // Check if already voted
        if (poll.alreadyVoted.includes(email)) { return; }

        const option = poll.options.find(o => o.optionName === optionName);
        if (!option) { return; }

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
    public async getPollsForGroup(groupId: number): Promise<Poll[]> {
        assert(this.db, "Database not initialized");
        const group = this.db.data.groups.find(g => g.id === groupId);
        return group ? group.polls : [];
    }

    public async getGroupInfo(groupId: number): Promise<{ id: number; name: string; description: string; members: number } | null> {
        assert(this.db.data, "Database not initialized");
        const group = this.db.data.groups.find(g => g.id === groupId);
        if (!group) return null;
        const members = this.db.data.userGroups.filter(ug => ug.groupId === groupId).length;
        return { id: group.id, name: group.name, description: group.description, members };
    }

    public async getGroupPublicInfo(groupId: number): Promise<{ id: number; name: string; description: string } | null> {
        assert(this.db.data, "Database not initialized");
        const group = this.db.data.groups.find(g => g.id === groupId);
        if (!group) return null;
        return { id: group.id, name: group.name, description: group.description };
    }

    private async sendPollResultsEmail(adminEmail: string, poll: Poll, groupName: string): Promise<void> {
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

            let resultsText = `Poll "${poll.title}" in group "${groupName}" has ended.\n\nResults:\n`;
            for (const option of poll.options) {
                resultsText += `${option.optionName}: ${option.votes} votes\n`;
            }
            resultsText += `\nTotal votes: ${poll.votes}`;

            const info = await transporter.sendMail({
                from: `"VoxPlatform Poll Results" <${process.env.MAIL_USER}>`,
                to: adminEmail,
                subject: `Poll Results: ${poll.title}`,
                text: resultsText,
            });

            console.log("Poll results email sent:", info.response);
        } catch (error) {
            console.error("Error sending poll results email:", error);
        }
    }

    public async checkPollDates() : Promise<void> {
        assert(this.db.data, "Database not initialized");
        const now = new Date();
        for (const group of this.db.data.groups) {
            for (let i = group.polls.length - 1; i >= 0; i--) {
                const poll = group.polls[i];
                if (new Date(poll.end) <= now) {
                    // Find admins
                    const admins = this.db.data.userGroups.filter(ug => ug.groupId === group.id && ug.role === "admin");
                    for (const admin of admins) {
                        await this.sendPollResultsEmail(admin.userEmail, poll, group.name);
                    }
                    // Delete poll
                    group.polls.splice(i, 1);
                }
            }
        }
        await this.db.write();
    }

    public isReady(): boolean {
        return !!this.db.data;
    }

    public startPollChecker(intervalMs: number = 60000): void {
        setInterval(async () => {
            try {
                await this.checkPollDates();
            } catch (error) {
                console.error("Error in poll checker:", error);
            }
        }, intervalMs);
    }
}


