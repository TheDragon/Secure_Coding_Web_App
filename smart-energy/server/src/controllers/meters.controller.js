import Meter from '../models/Meter.js';
import Household from '../models/Household.js';
import { isMemberOfHousehold } from '../utils/permissions.js';

export async function createMeter(req, res, next) {
  try {
    const { householdId, type, unit, label } = req.body;
    const hh = await Household.findById(householdId).lean({ getters: true });
    if (!hh) return res.status(404).json({ message: 'Household not found.' });
    if (hh.owner?.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const exists = await Meter.findOne({ householdId, label }); // [REQ:Validation:uniqueness]
    if (exists) return res.status(409).json({ message: 'Label must be unique per household.' });
    const meter = await Meter.create({ householdId, type, unit, label });
    res.status(201).json({ meter });
  } catch (e) {
    next({ status: 400, message: 'Unable to create meter.' });
  }
}

export async function listMeters(req, res, next) {
  try {
    const { householdId } = req.query;
    let query = {};
    if (householdId) {
      const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, householdId)); // [REQ:Auth:permissionCheck]
      if (!member) return res.status(403).json({ message: 'Forbidden' });
      query = { householdId };
    } else if (req.user?.role !== 'admin') {
      // Restrict to households user belongs to
      const households = await Household.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] }).select('_id').lean(); // [REQ:NoSQLi:parameterized]
      query = { householdId: { $in: households.map((h) => h._id) } };
    }
    const meters = await Meter.find(query).lean(); // [REQ:NoSQLi:parameterized]
    res.json({ meters });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch meters.' });
  }
}

export async function deleteMeter(req, res, next) {
  try {
    const m = await Meter.findById(req.params.id);
    if (!m) return res.status(404).json({ message: 'Meter not found.' });
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, m.householdId));
    if (!member) return res.status(403).json({ message: 'Forbidden' }); // [REQ:Auth:permissionCheck]
    await Meter.deleteOne({ _id: m._id });
    res.json({ message: 'Deleted' });
  } catch (e) {
    next({ status: 400, message: 'Unable to delete meter.' });
  }
}
