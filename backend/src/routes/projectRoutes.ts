import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  addProjectChat,
  deleteProject,
} from '../controllers/projectController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:projectId', getProjectById);
router.patch('/:projectId', updateProject);
router.post('/:projectId/chat', addProjectChat);
router.delete('/:projectId', deleteProject);

export default router;
