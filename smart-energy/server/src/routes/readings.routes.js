import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createReading, listByMeter, updateReading } from '../controllers/readings.controller.js';
import { readingCreateValidator, readingUpdateValidator, readingsQueryValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, requireRole('admin'), readingCreateValidator, validateRequest, createReading);
router.get('/by-meter/:meterId', requireAuth, readingsQueryValidator, validateRequest, listByMeter); // [REQ:NoSQLi:parameterized]
router.patch('/:id', requireAuth, requireRole('admin'), readingUpdateValidator, validateRequest, updateReading);

export default router;
