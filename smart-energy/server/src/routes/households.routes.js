import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createHousehold, getMine, getById, updateHousehold, addMember, removeMember } from '../controllers/households.controller.js';
import { householdCreateValidator } from '../utils/validators.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, householdCreateValidator, validateRequest, createHousehold);
router.get('/mine', requireAuth, getMine);
router.get('/:id', requireAuth, getById);
router.patch('/:id', requireAuth, updateHousehold);
router.post('/:id/members', requireAuth, addMember); // [REQ:Auth:permissionCheck]
router.delete('/:id/members', requireAuth, removeMember);

export default router;
