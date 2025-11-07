import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createMeter, listMeters, deleteMeter } from '../controllers/meters.controller.js';
import { meterCreateValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, meterCreateValidator, validateRequest, createMeter);
router.get('/', requireAuth, listMeters);
router.delete('/:id', requireAuth, deleteMeter);

export default router;
