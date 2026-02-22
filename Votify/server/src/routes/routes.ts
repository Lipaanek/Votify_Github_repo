/**
 * @module Routes
 */
import { Router, Request, Response } from 'express';
import { sendVerificationMail, validateCode } from '../auth';
import { generateCookie, saveCookie, validateCookie } from '../cookies';
import { Database } from "../models/db"

const router = Router();

const dbInstance = new Database();
dbInstance.init().then(async () => {
    console.log("Database initialized");
    await dbInstance.checkPollDates();
}).catch(err => {
    console.error("Error initializing database:", err);
});

dbInstance.startPollChecker();

export function dbExists() {
    return dbInstance !== null;
}

router.get('/api/login', async (req : Request, res : Response) => {
    if (!dbExists()) { return; }
    console.log('GET request to /api/login');
    if (!req.query.email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    if(await !dbInstance.doesUserExist(req.query.email as string)) {
        return res.status(400).json({ error: 'User does not exist' });
    }

    sendVerificationMail(req.query.email as string);
    res.json({ message: 'Login endpoint hit' });
});

router.get('/api/register', async (req : Request, res : Response) => {
    if (!dbExists()) { return; }
    console.log('GET request to /api/register');
    if (!req.query.email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    if(await dbInstance.doesUserExist(req.query.email as string)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    try {
        await dbInstance.addUser({ email: req.query.email as string, name: '' });
        sendVerificationMail(req.query.email as string);
        res.json({ message: 'Register endpoint hit' });
    } catch (err) {
        console.error("Error adding user to database:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/login/code', (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const code = req.query.code as string;
    const email = req.query.email as string;
    console.log(`Verifying code ${code} for email ${email}`);
    validateCode(email, code)
        .then(async isValid => {
            if (isValid) {
                const cookie = generateCookie();
                await saveCookie(email, cookie);
                res.cookie('session', cookie, {
                  httpOnly: true,
                  maxAge: 24 * 60 * 60 * 1000,
                  sameSite: 'lax',
                  secure: false
                });
                res.json({ message: 'Code is valid' });
            } else {
                console.log(`Invalid code attempt for email ${email}`);
                res.status(400).json({ error: 'Invalid code' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.get('/api/auth/check', async (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }
    res.json({ authenticated: true, email });
});

router.get('/api/info/groups', async (req: Request, res: Response) => {
    const email = req.query.email as string;
    if (!dbExists() || !email) { return; }

    const info: any = await dbInstance.getUserInfo(email);
    if (!info) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(info)
});

router.post('/api/group', async (req: Request, res: Response) => {
    console.log('POST request to /api/group');
    if (!dbExists()) {
        console.log('Database does not exist');
        return res.status(500).json({ error: 'Database not available' });
    }
    if (!dbInstance.isReady()) {
        console.log('Database not ready');
        return res.status(500).json({ error: 'Database not ready' });
    }
    const cookie = req.cookies.session;
    if (!cookie) {
        console.log('No session cookie');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        console.log('Invalid session cookie');
        return res.status(401).json({ error: 'Invalid session' });
    }
    console.log(`Authenticated user: ${email}`);

    const { name, description } = req.body;
    console.log(`Group creation request: name=${name}, description=${description}`);
    if (!name) {
        console.log('Group name is required');
        return res.status(400).json({ error: 'Group name is required' });
    }

    try {
        console.log('Attempting to add group to database');
        const groupId = await dbInstance.addGroup({ name, description: description || '', last_use: new Date().toISOString() });
        console.log(`Group created with ID: ${groupId}`);
        console.log('Attempting to add user to group');
        await dbInstance.addUserToGroup(email, groupId, 'admin');
        console.log('User added to group successfully');
        res.json({ message: 'Group created', groupId });
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ error: 'Error creating group' });
    }
});

router.post('/api/poll', async (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }

    const { groupId, title, end } = req.body;
    if (!groupId || !title || !end) {
        return res.status(400).json({ error: 'Group ID, title, and end date are required' });
    }

    try {
        const pollId = await dbInstance.addPollToGroup({ votes: 0, end, title }, groupId);
        res.json({ message: 'Poll created', pollId });
    } catch (err) {
        console.error('Error creating poll:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/poll/:pollId', async (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }

    const pollId = parseInt(req.params.pollId);
    if (isNaN(pollId)) {
        return res.status(400).json({ error: 'Invalid poll ID' });
    }

    try {
        const poll = await dbInstance.getPollById(pollId);
        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }
        res.json({ poll });
    } catch (err) {
        console.error('Error fetching poll:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/poll/:pollId/option', async (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }

    const pollId = parseInt(req.params.pollId);
    if (isNaN(pollId)) {
        return res.status(400).json({ error: 'Invalid poll ID' });
    }

    const { optionName, optionDescription } = req.body;
    if (!optionName) {
        return res.status(400).json({ error: 'Option name is required' });
    }

    try {
        await dbInstance.addOptionToPoll(pollId, { optionName, optionDescription });
        res.json({ success: true });
    } catch (err) {
        console.error('Error adding option:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/info/polls', async (req: Request, res: Response) => {
    const email = req.query.email as string;
    if (!dbExists() || !email) { return; }

    try {
        const polls = await dbInstance.getPollsForUser(email);
        res.json({ polls });
    } catch (err) {
        console.error('Error fetching polls:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/group/:groupId/polls', async (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }

    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
        return res.status(400).json({ error: 'Invalid group ID' });
    }

    try {
        const polls = await dbInstance.getPollsForGroup(groupId);
        res.json({ polls });
    } catch (err) {
        console.error('Error fetching polls:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/group/:groupId/info', async (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }

    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
        return res.status(400).json({ error: 'Invalid group ID' });
    }

    try {
        const groupInfo = await dbInstance.getGroupInfo(groupId);
        if (!groupInfo) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json({ group: groupInfo });
    } catch (err) {
        console.error('Error fetching group info:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/group/:groupId/public', async (req: Request, res: Response) => {
    if (!dbExists()) { return; }
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
        return res.status(400).json({ error: 'Invalid group ID' });
    }

    try {
        const groupInfo = await dbInstance.getGroupPublicInfo(groupId);
        if (!groupInfo) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json({ group: groupInfo });
    } catch (err) {
        console.error('Error fetching group public info:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/group/:groupId/join', async (req: Request, res: Response) => {
    if (!dbExists() || !dbInstance.isReady()) { return res.status(500).json({ error: 'Database not ready' }); }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }

    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
        return res.status(400).json({ error: 'Invalid group ID' });
    }

    try {
        const userExists = await dbInstance.doesUserExist(email);
        if (!userExists) {
            await dbInstance.addUser({ email, name: '' });
        }

        const groupInfo = await dbInstance.getGroupPublicInfo(groupId);
        if (!groupInfo) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const userGroups = await dbInstance.getUserInfo(email);
        if (userGroups && userGroups.userGroups.some(g => g.id === groupId)) {
            return res.status(400).json({ error: 'Already a member of this group' });
        }

        await dbInstance.addUserToGroup(email, groupId, 'member');
        res.json({ success: true });
    } catch (err) {
        console.error('Error joining group:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/poll/:pollId/vote', async (req: Request, res: Response) => {
    if(!dbExists()) { return; }
    const cookie = req.cookies.session;
    if (!cookie) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const email = await validateCookie(cookie);
    if (!email) {
        return res.status(401).json({ error: 'Invalid session' });
    }

    const pollId = parseInt(req.params.pollId);
    if(isNaN(pollId)) {
        return res.status(400).json({ error: 'Invalid poll ID' });
    }

    const { optionName } = req.body;
    if(!optionName) {
        return res.status(400).json({ error: 'Option name is required' });
    }

    try {
        await dbInstance.addVoteToPollOption(email, pollId, optionName);
        res.json({ success: true });
    } catch (err) {
        console.error('Error voting:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;