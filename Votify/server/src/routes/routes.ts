import {Router, Request, Response} from 'express';
import { sendVerificationMail } from '../auth';

const router = Router();

router.get('/api/login', (req : Request, res : Response) => {
    console.log('GET request to /');
    if (!req.query.email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    sendVerificationMail(req.query.email as string);
    res.json({ message: 'Login endpoint hit' });
});

export default router;