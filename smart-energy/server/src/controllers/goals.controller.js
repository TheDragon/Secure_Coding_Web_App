import Goal from '../models/Goal.js';
import Meter from '../models/Meter.js';
import { isMemberOfHousehold } from '../utils/permissions.js';

export async function createGoal(req, res, next) {
  try {
    const { householdId, meterType, period, limit } = req.body;
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, householdId)); // [REQ:Auth:permissionCheck]
    if (!member) return res.status(403).json({ message: 'Forbidden' });
    // Ensure a meter of this type exists in the household before creating a goal
    const hasMeter = await Meter.findOne({ householdId, type: meterType }).lean(); // [REQ:NoSQLi:parameterized]
    if (!hasMeter) return res.status(400).json({ message: 'Add a meter of this type to the household first.' });
    const goal = await Goal.create({ householdId, meterType, period, limit });
    res.status(201).json({ goal });
  } catch (e) {
    next({ status: 400, message: 'Unable to create goal.' }); // [REQ:Errors:userFriendly]
  }
}

export async function listGoals(req, res, next) {
  try {
    const { householdId } = req.query;
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, householdId)); // [REQ:Auth:permissionCheck]
    if (!member) return res.status(403).json({ message: 'Forbidden' });
    const goals = await Goal.find({ householdId }).lean(); // [REQ:NoSQLi:parameterized]
    res.json({ goals });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch goals.' });
  }
}

export async function updateGoal(req, res, next) {
  try {
    const existing = await Goal.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Goal not found.' });
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, existing.householdId));
    if (!member) return res.status(403).json({ message: 'Forbidden' }); // [REQ:Auth:permissionCheck]
    // If meterType is changing, ensure a meter of that type exists
    const newType = req.body.meterType || existing.meterType;
    const hasMeter = await Meter.findOne({ householdId: existing.householdId, type: newType }).lean();
    if (!hasMeter) return res.status(400).json({ message: 'Add a meter of this type to the household first.' });
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ goal });
  } catch (e) {
    next({ status: 400, message: 'Unable to update goal.' });
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const existing = await Goal.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Goal not found.' });
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, existing.householdId));
    if (!member) return res.status(403).json({ message: 'Forbidden' }); // [REQ:Auth:permissionCheck]
    await Goal.deleteOne({ _id: existing._id });
    res.json({ message: 'Deleted' });
  } catch (e) {
    next({ status: 400, message: 'Unable to delete goal.' });
  }
}
