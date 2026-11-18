import { Router } from 'express';
import { getProjects, createProject, deleteProject } from '../controllers/projectController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProjects);
router.post('/', createProject);
router.delete('/:projectId', deleteProject);

export default router;
