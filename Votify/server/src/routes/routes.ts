import {Router, Request, Response} from 'express';
import { sendVerificationMail, validateCode } from '../auth';
import { generateCookie, saveCookie, validateCookie } from '../cookies';
import { Database } from "../models/db"

const router = Router();

const dbInstance = new Database();
dbInstance.init().then(() => {
    console.log("Database initialized");
}).catch(err => {
    console.error("Error initializing database:", err);
});

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
                  secure: false // Set to true in production with HTTPS
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


export default router;