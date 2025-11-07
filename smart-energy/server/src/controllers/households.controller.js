import Household from '../models/Household.js';
import User from '../models/User.js';

export async function createHousehold(req, res, next) {
  try {
    const { name, address } = req.body;
    const doc = await Household.create({ name, address, owner: req.user.id }); // [REQ:Validation:presence]
    res.status(201).json({ household: doc });
  } catch (e) {
    next({ status: 400, message: 'Unable to create household.' }); // [REQ:Errors:userFriendly]
  }
}

export async function getMine(req, res, next) {
  try {
    const households = await Household.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] }).lean(); // [REQ:NoSQLi:parameterized]
    res.json({ households });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch households.' });
  }
}

export async function getById(req, res, next) {
  try {
    const h = await Household.findById(req.params.id).lean();
    if (!h) return res.status(404).json({ message: 'Household not found.' });
    const isMember = h.owner?.toString() === req.user.id || (h.members || []).some((m) => String(m) === req.user.id);
    if (!isMember && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' }); // [REQ:Auth:permissionCheck]
    res.json({ household: h });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch household.' });
  }
}

export async function updateHousehold(req, res, next) {
  try {
    const h = await Household.findById(req.params.id);
    if (!h) return res.status(404).json({ message: 'Household not found.' });
    if (String(h.owner) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    if (req.body.name) h.name = req.body.name;
    if (req.body.address) h.address = req.body.address; // sanitized via model setter // [REQ:XSS:validate]
    await h.save();
    res.json({ household: h });
  } catch (e) {
    next({ status: 400, message: 'Update failed.' });
  }
}

export async function addMember(req, res, next) {
  try {
    const { email } = req.body;
    const h = await Household.findById(req.params.id);
    if (!h) return res.status(404).json({ message: 'Household not found.' });
    if (String(h.owner) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!h.members.find((m) => String(m) === String(user._id))) {
      h.members.push(user._id);
      await h.save();
    }
    res.json({ household: h });
  } catch (e) {
    next({ status: 400, message: 'Unable to add member.' });
  }
}

export async function removeMember(req, res, next) {
  try {
    const { userId } = req.body;
    const h = await Household.findById(req.params.id);
    if (!h) return res.status(404).json({ message: 'Household not found.' });
    if (String(h.owner) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    h.members = (h.members || []).filter((m) => String(m) !== String(userId));
    await h.save();
    res.json({ household: h });
  } catch (e) {
    next({ status: 400, message: 'Unable to remove member.' });
  }
}
