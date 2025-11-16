import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createHousehold, getMine, getById, updateHousehold, addMember, removeMember, deleteHousehold } from '../controllers/households.controller.js';
import { householdCreateValidator, householdUpdateValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';
import { sanitizeBodyStrings } from '../middleware/sanitize.js';

const router = Router();

router.post('/', requireAuth, householdCreateValidator, sanitizeBodyStrings(['name', 'address']), validateRequest, createHousehold);
router.get('/mine', requireAuth, getMine);
router.get('/:id', requireAuth, getById);
router.patch('/:id', requireAuth, householdUpdateValidator, sanitizeBodyStrings(['name', 'address']), validateRequest, updateHousehold);
router.post('/:id/members', requireAuth, addMember); // [REQ:Auth:permissionCheck]
router.delete('/:id/members', requireAuth, removeMember);
router.delete('/:id', requireAuth, deleteHousehold);

export default router;
