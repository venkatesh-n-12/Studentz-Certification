import { Router } from 'express';
import { signup, login, getMe, universalLogin, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Universal login & registration for the frontend
router.post('/login', universalLogin);
router.post('/register', (req, res, next) => {
  const role = req.body.role || 'STUDENT';
  signup(role)(req, res, next);
});

// Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Student auth
router.post('/student/signup', signup('STUDENT'));
router.post('/student/login', login('STUDENT'));

// Admin auth
router.post('/admin/signup', signup('ADMIN'));
router.post('/admin/login', login('ADMIN'));

// Owner auth
router.post('/owner/login', login('OWNER'));

// Get current user
router.get('/me', authenticateJWT, getMe);

export default router;
