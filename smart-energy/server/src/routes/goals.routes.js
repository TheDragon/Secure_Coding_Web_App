import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createGoal, listGoals, updateGoal, deleteGoal } from '../controllers/goals.controller.js';
import { goalValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, goalValidator, validateRequest, createGoal);
router.get('/', requireAuth, listGoals);
router.patch('/:id', requireAuth, goalValidator, validateRequest, updateGoal);
router.delete('/:id', requireAuth, deleteGoal);

export default router;
