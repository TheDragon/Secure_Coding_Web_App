import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createMeter, listMeters, deleteMeter } from '../controllers/meters.controller.js';
import { meterCreateValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, requireRole('admin'), meterCreateValidator, validateRequest, createMeter);
router.get('/', requireAuth, listMeters);
router.delete('/:id', requireAuth, requireRole('admin'), deleteMeter);

export default router;
