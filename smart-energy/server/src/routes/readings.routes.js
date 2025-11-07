import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createReading, listByMeter } from '../controllers/readings.controller.js';
import { readingCreateValidator, readingsQueryValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, readingCreateValidator, validateRequest, createReading);
router.get('/by-meter/:meterId', requireAuth, readingsQueryValidator, validateRequest, listByMeter); // [REQ:NoSQLi:parameterized]

export default router;
