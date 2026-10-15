import { Router } from 'express';
import { getOpportunities, getOpportunityById, createOpportunity, updateOpportunity, deleteOpportunity, saveOpportunity, unsaveOpportunity } from '../controllers/opportunity.controller';
import { applyForOpportunity } from '../controllers/application.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// Protected routes (Admin/Owner)
router.post('/', authenticateJWT, requireRole(['ADMIN', 'OWNER']), createOpportunity);
router.patch('/:id', authenticateJWT, requireRole(['ADMIN', 'OWNER']), updateOpportunity);
router.delete('/:id', authenticateJWT, requireRole(['ADMIN', 'OWNER']), deleteOpportunity);

// Student actions
router.post('/:id/save', authenticateJWT, requireRole(['STUDENT']), saveOpportunity);
router.delete('/:id/save', authenticateJWT, requireRole(['STUDENT']), unsaveOpportunity);
router.post('/:id/apply', authenticateJWT, requireRole(['STUDENT']), applyForOpportunity);

export default router;
