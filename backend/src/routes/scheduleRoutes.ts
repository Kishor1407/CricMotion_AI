import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
  schedulePost,
  getScheduledPosts,
  cancelScheduledPost,
  publishPostNow,
} from '../controllers/scheduleController';

const router = Router();

// Protect all scheduling endpoints with JWT
router.use(authenticateJWT);

router.post('/', schedulePost);
router.get('/', getScheduledPosts);
router.delete('/:id', cancelScheduledPost);
router.post('/:id/publish-now', publishPostNow);

export default router;
