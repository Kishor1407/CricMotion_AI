import { Router } from 'express';
import { register, login, getMe, connectInstagram, disconnectInstagram } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.post('/instagram/connect', authenticateJWT, connectInstagram);
router.post('/instagram/disconnect', authenticateJWT, disconnectInstagram);

export default router;
