import Alert from '../models/Alert.js';
import Goal from '../models/Goal.js';
import { isMemberOfHousehold } from '../utils/permissions.js';

export async function listAlerts(req, res, next) {
  try {
    const { householdId } = req.query;
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, householdId)); // [REQ:Auth:permissionCheck]
    if (!member) return res.status(403).json({ message: 'Forbidden' });
    const alerts = await Alert.find({ householdId }).lean(); // [REQ:NoSQLi:parameterized]
    res.json({ alerts });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch alerts.' });
  }
}

export async function acknowledgeAlert(req, res, next) {
  try {
    const existing = await Alert.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: 'Alert not found.' });
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, existing.householdId));
    if (!member) return res.status(403).json({ message: 'Forbidden' }); // [REQ:Auth:permissionCheck]
    const a = await Alert.findByIdAndUpdate(existing._id, { status: 'acknowledged' }, { new: true });
    if (!a) return res.status(404).json({ message: 'Alert not found.' });
    res.json({ alert: a });
  } catch (e) {
    next({ status: 400, message: 'Unable to update alert.' });
  }
}
