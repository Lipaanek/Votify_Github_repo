import {Router, Request, Response} from 'express';
import { sendVerificationMail, validateCode } from '../auth';

const router = Router();

router.get('/api/login', (req : Request, res : Response) => {
    console.log('GET request to /');
    if (!req.query.email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    sendVerificationMail(req.query.email as string);
    res.json({ message: 'Login endpoint hit' });
});

router.get('/api/login/code', (req: Request, res: Response) => {
    const { code } = req.params;
    const email = req.query.email as string;
    console.log(`Verifying code ${code} for email ${email}`);
    validateCode(email, code)
        .then(isValid => {
            if (isValid) {
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


export default router;