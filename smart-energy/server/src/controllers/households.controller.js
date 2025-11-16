import crypto from 'crypto';
import env from '../config/env.js';
import Household from '../models/Household.js';
import User from '../models/User.js';
import Meter from '../models/Meter.js';
import Goal from '../models/Goal.js';
import Alert from '../models/Alert.js';
import Reading from '../models/Reading.js';
import { sendMail } from '../utils/mail.js';

const APP_URL = env.CORS_ORIGIN || 'http://localhost:5173';

function generateStrongPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + digits + special;
  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (chars.length < 12) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

async function buildUsername(baseEmail) {
  const local = baseEmail.split('@')[0];
  let base = local.replace(/[^a-z0-9._-]/gi, '').toLowerCase();
  if (!base) base = `user${crypto.randomInt(1000, 9999)}`;
  let username = base;
  let counter = 1;
  while (await User.findOne({ username })) {
    username = `${base}${counter++}`;
  }
  return username;
}

export async function createHousehold(req, res, next) {
  try {
    const { name, address, residentEmail, residentName } = req.body;
    if (!residentEmail || !residentName) {
      return res.status(400).json({ message: 'Resident name and email are required.' });
    }
    const emailLower = residentEmail.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ message: 'Resident email already registered.' });
    }
    const username = await buildUsername(emailLower);
    const password = generateStrongPassword();
    const newUser = await User.create({
      username,
      email: emailLower,
      passwordHash: password,
      role: 'user',
    });
    const tempCredentials = { username, password, email: emailLower, residentName };

    const doc = await Household.create({
      name,
      address,
      contactEmail: emailLower,
      owner: newUser._id,
      members: [req.user.id],
    }); // [REQ:Validation:presence]

    try {
      await sendMail({
        to: tempCredentials.email,
        subject: 'Welcome to Smart Energy Household',
        text: `Hi ${tempCredentials.residentName},\n\nYour household "${name}" has been created for you.\n\nUsername: ${tempCredentials.username}\nTemporary Password: ${tempCredentials.password}\nLogin: ${APP_URL}\n\nPlease sign in and use the Forgot Password option to set your own password.`,
      });
    } catch (_) {}
    res.status(201).json({ household: doc });
  } catch (e) {
    next({ status: 400, message: e.message || 'Unable to create household.' }); // [REQ:Errors:userFriendly]
  }
}

export async function getMine(req, res, next) {
  try {
    if (req.user.role === 'admin') {
      const households = await Household.find().lean({ getters: true });
      return res.json({ households });
    }
    const households = await Household.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] }).lean({ getters: true }); // [REQ:NoSQLi:parameterized]
    res.json({ households });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch households.' });
  }
}

export async function getById(req, res, next) {
  try {
    const h = await Household.findById(req.params.id).lean({ getters: true });
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
    if (req.body.contactEmail) h.contactEmail = req.body.contactEmail;
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

export async function deleteHousehold(req, res, next) {
  try {
    const h = await Household.findById(req.params.id);
    if (!h) return res.status(404).json({ message: 'Household not found.' });
    if (String(h.owner) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const meters = await Meter.find({ householdId: h._id }).select('_id');
    const meterIds = meters.map((m) => m._id);
    if (meterIds.length) {
      await Reading.deleteMany({ meterId: { $in: meterIds } });
    }
    await Meter.deleteMany({ householdId: h._id });
    await Goal.deleteMany({ householdId: h._id });
    await Alert.deleteMany({ householdId: h._id });
    await Household.deleteOne({ _id: h._id });
    res.json({ message: 'Household deleted.' });
  } catch (e) {
    next({ status: 400, message: 'Unable to delete household.' });
  }
}
