import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listAlerts, acknowledgeAlert } from '../controllers/alerts.controller.js';
import { alertAckValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.get('/', requireAuth, listAlerts);
router.post('/:id/ack', requireAuth, requireRole('admin'), alertAckValidator, validateRequest, acknowledgeAlert);

export default router;
