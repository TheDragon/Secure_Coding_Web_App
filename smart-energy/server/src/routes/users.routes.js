import { Router } from 'express';
import { me, updateMe } from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { body } from 'express-validator';
import { sanitizeBodyStrings } from '../middleware/sanitize.js';

const router = Router();

router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 32 })
    .matches(/^[a-z0-9._-]+$/), // [REQ:Validation:format]
  body('email').optional().isEmail(), // [REQ:Validation:format]
], sanitizeBodyStrings(['username']), validateRequest, updateMe);

export default router;
