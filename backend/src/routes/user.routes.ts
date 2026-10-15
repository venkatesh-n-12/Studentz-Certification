import { Router } from 'express';
import { getMyApplications, getMySavedOpportunities, updateProfile } from '../controllers/user.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/me/applications', requireRole(['STUDENT']), getMyApplications);
router.get('/me/saved', requireRole(['STUDENT']), getMySavedOpportunities);
router.patch('/me', updateProfile);

export default router;
