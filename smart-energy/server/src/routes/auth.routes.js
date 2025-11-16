import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, refreshSession, logout } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator, forgotValidator, resetValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, register); // [REQ:Validation:*]
router.post('/login', loginValidator, validateRequest, login);
router.post('/forgot-password', forgotValidator, validateRequest, forgotPassword); // [REQ:Auth:passwordRecovery]
router.post('/reset-password', resetValidator, validateRequest, resetPassword); // [REQ:Auth:passwordRecovery]
router.post('/refresh', refreshSession);
router.post('/logout', requireAuth, logout);

export default router;
