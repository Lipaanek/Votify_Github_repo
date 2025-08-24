import {Router, Request, Response} from 'express';

const router = Router();

router.get('/login', (req : Request, res : Response) => {
    console.log('GET request to /');
    res.json({ message: 'pong' });
});

export default router;