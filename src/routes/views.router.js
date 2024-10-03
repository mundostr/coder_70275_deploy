import { Router } from 'express';
// import { users } from '../config.js';


const router = Router();


router.get('/chat', (req, res) => {
    const data = {};
    
    res.status(200).render('chat', data);
});


export default router;