import Reading from '../models/Reading.js';
import Meter from '../models/Meter.js';
import Goal from '../models/Goal.js';
import Alert from '../models/Alert.js';
import { sanitizeString } from '../middleware/sanitize.js';
import { computePeriodRange } from '../utils/period.js';
import { isMemberOfHousehold } from '../utils/permissions.js';

export async function createReading(req, res, next) {
  try {
    const { meterId, value, recordedAt, notes } = req.body;
    const m = await Meter.findById(meterId).lean();
    if (!m) return res.status(404).json({ message: 'Meter not found.' });
    // Permission: user must be a member of meter's household or admin
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, m.householdId)); // [REQ:Auth:permissionCheck]
    if (!member) return res.status(403).json({ message: 'Forbidden' });
    const doc = await Reading.create({ meterId, value, recordedAt, notes: sanitizeString(notes || '') }); // [REQ:XSS:validate]
    // On-write alert trigger
    try {
      const goals = await Goal.find({ householdId: m.householdId, meterType: m.type }).lean(); // [REQ:NoSQLi:parameterized]
      if (goals.length) {
        // Get all meter ids for this household and type
        const meterIds = (await Meter.find({ householdId: m.householdId, type: m.type }).select('_id').lean()).map((x) => x._id);
        for (const g of goals) {
          const { start, end } = computePeriodRange(new Date(recordedAt), g.period);
          const agg = await Reading.aggregate([
            { $match: { meterId: { $in: meterIds }, recordedAt: { $gte: start, $lt: end } } }, // [REQ:NoSQLi:parameterized]
            { $group: { _id: null, total: { $sum: '$value' } } },
          ]);
          const total = agg[0]?.total || 0;
          if (total > g.limit) {
            const message = sanitizeString(`Usage ${total.toFixed(2)} ${m.type === 'electricity' ? 'kWh' : 'L'} exceeded ${g.limit} for ${g.period} (${g.meterType}).`); // [REQ:XSS:validate]
            await Alert.findOneAndUpdate(
              { goalId: g._id, periodStart: start, periodEnd: end },
              { $setOnInsert: { householdId: m.householdId }, $set: { status: 'open', message } },
              { upsert: true, new: true }
            );
          }
        }
      }
    } catch (e) {
      // Non-fatal for request flow
    }
    res.status(201).json({ reading: doc });
  } catch (e) {
    next({ status: 400, message: 'Unable to create reading.' }); // [REQ:Errors:userFriendly]
  }
}

export async function listByMeter(req, res, next) {
  try {
    const { meterId } = req.params;
    const { from, to, page = 1, limit = 20 } = req.query;
    const m = await Meter.findById(meterId).lean();
    if (!m) return res.status(404).json({ message: 'Meter not found.' });
    const member = req.user?.role === 'admin' || (await isMemberOfHousehold(req.user.id, m.householdId)); // [REQ:Auth:permissionCheck]
    if (!member) return res.status(403).json({ message: 'Forbidden' });
    const query = { meterId };
    if (from || to) {
      query.recordedAt = {};
      if (from) query.recordedAt.$gte = new Date(from);
      if (to) query.recordedAt.$lte = new Date(to);
    }
    const docs = await Reading.find(query) // [REQ:NoSQLi:parameterized]
      .sort({ recordedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    res.json({ readings: docs });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch readings.' });
  }
}
