import { Router } from 'express';
import { getApplicationById, withdrawApplication, updateApplicationStatus } from '../controllers/application.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id', authenticateJWT, getApplicationById);
router.patch('/:id/withdraw', authenticateJWT, requireRole(['STUDENT']), withdrawApplication);
router.patch('/:id/status', authenticateJWT, requireRole(['ADMIN', 'OWNER']), updateApplicationStatus);

export default router;
