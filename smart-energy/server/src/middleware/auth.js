import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import Household from '../models/Household.js';
import RefreshToken from '../models/RefreshToken.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required.' }); // [REQ:Auth:jwtRoleSession]
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!payload.sid) return res.status(401).json({ message: 'Session invalid.' });
    const session = await RefreshToken.findById(payload.sid).lean();
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Session expired.' });
    }
    req.sessionId = session._id.toString();
    req.user = { id: payload.sub, role: payload.role }; // [REQ:Auth:jwtRoleSession]
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token.' }); // [REQ:Errors:userFriendly]
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' }); // [REQ:Auth:permissionCheck] [REQ:Auth:userRoles]
    }
    next();
  };
}

export async function requireHouseholdMember(req, res, next) {
  try {
    const householdId = req.params.id || req.body.householdId;
    if (!householdId) return res.status(400).json({ message: 'Household id required.' });
    const h = await Household.findById(householdId).lean({ getters: true }); // [REQ:NoSQLi:parameterized]
    if (!h) return res.status(404).json({ message: 'Household not found.' });
    const isMember = h.owner?.toString() === req.user.id || (h.members || []).some((m) => String(m) === req.user.id);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not a member of this household.' }); // [REQ:Auth:permissionCheck]
    }
    req.household = h;
    next();
  } catch (e) {
    return res.status(500).json({ message: 'Unable to verify membership.' }); // [REQ:Errors:userFriendly]
  }
}
