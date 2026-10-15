import { Router } from 'express';
import { getAdmins, getAdminRequests, approveAdmin, rejectAdmin, deleteAdmin } from '../controllers/owner.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['OWNER']));

router.get('/admins', getAdmins);
router.get('/admin-requests', getAdminRequests);
router.patch('/admin-requests/:id/approve', approveAdmin);
router.patch('/admin-requests/:id/reject', rejectAdmin);
router.delete('/admins/:id', deleteAdmin);

export default router;
