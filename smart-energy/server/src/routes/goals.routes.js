import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createGoal, listGoals, updateGoal, deleteGoal } from '../controllers/goals.controller.js';
import { goalValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, requireRole('admin'), goalValidator, validateRequest, createGoal);
router.get('/', requireAuth, requireRole('admin'), listGoals);
router.patch('/:id', requireAuth, requireRole('admin'), goalValidator, validateRequest, updateGoal);
router.delete('/:id', requireAuth, requireRole('admin'), deleteGoal);

export default router;
