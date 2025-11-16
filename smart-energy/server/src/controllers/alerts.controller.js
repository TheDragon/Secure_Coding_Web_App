import Alert from '../models/Alert.js';
import Goal from '../models/Goal.js';
import Household from '../models/Household.js';
import User from '../models/User.js';
import { sendMail } from '../utils/mail.js';
import { isMemberOfHousehold } from '../utils/permissions.js';

export async function listAlerts(req, res, next) {
  try {
    const { householdId } = req.query;
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, householdId)); // [REQ:Auth:permissionCheck]
    if (!member) return res.status(403).json({ message: 'Forbidden' });
    const query = { householdId };
    if (req.user.role !== 'admin') {
      query.status = 'acknowledged';
    }
    const alerts = await Alert.find(query).lean(); // [REQ:NoSQLi:parameterized]
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
    try {
      const h = await Household.findById(existing.householdId).lean({ getters: true });
      const to = h?.contactEmail;
      if (to) {
        const userBody = `Hello,

Your household "${h?.name || ''}" triggered an alert:
${existing.message || 'Usage exceeded your configured goal.'}

An administrator has reviewed and acknowledged this alert. Please log in to Smart Energy to view current readings and adjust usage if necessary.

- Smart Energy Team`;
        await sendMail({
          to,
          subject: 'Smart Energy Alert Acknowledged',
          text: userBody,
        });
      }
      const actor = await User.findById(req.user.id).lean();
      if (actor?.email) {
        await sendMail({
          to: actor.email,
          subject: `Alert acknowledged for ${h?.name || 'household'}`,
          text: `You acknowledged the following alert for ${h?.name || ''}:
${existing.message || ''}

Resident notified at: ${to || 'N/A'}`,
        });
      }
    } catch (_) {}
    if (!a) return res.status(404).json({ message: 'Alert not found.' });
    res.json({ alert: a });
  } catch (e) {
    next({ status: 400, message: 'Unable to update alert.' });
  }
}
