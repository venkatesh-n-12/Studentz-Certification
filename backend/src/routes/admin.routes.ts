import { Router } from 'express';
import { getAdminApplications } from '../controllers/admin.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['ADMIN', 'OWNER']));

router.get('/opportunities/:id/applications', getAdminApplications);

export default router;
