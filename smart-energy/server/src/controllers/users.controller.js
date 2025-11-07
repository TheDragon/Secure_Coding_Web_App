import User from '../models/User.js';

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).lean(); // [REQ:NoSQLi:parameterized]
    res.json({ user });
  } catch (e) {
    next({ status: 500, message: 'Unable to fetch profile.' }); // [REQ:Errors:userFriendly]
  }
}

export async function updateMe(req, res, next) {
  try {
    const updates = {};
    if (req.body.username) updates.username = String(req.body.username).toLowerCase();
    if (req.body.email) updates.email = String(req.body.email).toLowerCase();
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }); // [REQ:NoSQLi:parameterized]
    res.json({ user });
  } catch (e) {
    next({ status: 400, message: 'Update failed.' }); // [REQ:Errors:userFriendly]
  }
}
