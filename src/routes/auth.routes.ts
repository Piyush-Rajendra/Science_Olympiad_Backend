import { Router } from 'express';
import { register, login, getAllUsers } from '../controllers/auth.controllers';
import { authenticateJWT } from '../middlewares/extractJWT';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticateJWT, getAllUsers);

export default router;
