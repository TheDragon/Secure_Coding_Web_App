import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { sanitizeString } from '../middleware/sanitize.js';
import { sendMail } from '../utils/mail.js';

function signToken(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN }); // [REQ:Auth:jwtRoleSession]
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] }); // [REQ:NoSQLi:parameterized]
    if (exists) return res.status(409).json({ message: 'Username or email already in use.' }); // [REQ:Validation:uniqueness]
    const user = await User.create({ username, email, passwordHash: password }); // [REQ:Validation:*]
    const token = signToken(user);
    try {
      await sendMail({
        to: user.email,
        subject: 'Welcome to Smart Energy',
        text: `Hi ${user.username}, welcome to Smart Energy!`,
      });
    } catch (_) {}
    res.status(201).json({ token, user });
  } catch (e) {
    logger.warn('Register failed', { error: e.message });
    next({ status: 400, message: 'Registration failed. Check inputs.' }); // [REQ:Errors:userFriendly]
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // [REQ:NoSQLi:parameterized]
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' }); // [REQ:Auth:usernamePassword]
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' }); // [REQ:Auth:usernamePassword]
    const token = signToken(user);
    res.json({ token, user }); // [REQ:Auth:jwtRoleSession]
  } catch (e) {
    next({ status: 500, message: 'Unable to login.' }); // [REQ:Errors:userFriendly]
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found for that email.' }); // [REQ:Errors:userFriendly]
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + env.RESET_TOKEN_EXPIRES_MIN * 60 * 1000);
    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt }); // [REQ:Auth:passwordRecovery]
    try {
      const resetLink = `http://localhost:${env.PORT}/api/auth/reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
      await sendMail({
        to: email,
        subject: 'Smart Energy Password Reset',
        text: `We received a request to reset your password.

If you initiated this, use the token below to reset your password in the app:

Token: ${token}

Alternatively, open this link: ${resetLink}

If you did not request this, please ignore this email.`,
      });
    } catch (mailErr) {
      logger.error('Failed to send reset email', { error: mailErr.message });
      return res.status(500).json({ message: 'Unable to send reset email.' });
    }
    logger.info('Password reset token created');
    res.json({ message: 'Password reset instructions sent.' });
  } catch (e) {
    next({ status: 500, message: 'Unable to process request.' });
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password, email } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid token.' });
    const rec = await PasswordResetToken.findOne({ userId: user._id, tokenHash });
    if (!rec || rec.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired token.' });
    user.passwordHash = password; // will be hashed in pre-save // [REQ:Auth:passwordRecovery]
    await user.save();
    await PasswordResetToken.deleteMany({ userId: user._id });
    res.json({ message: 'Password reset successful.' });
  } catch (e) {
    next({ status: 500, message: 'Unable to reset password.' }); // [REQ:Errors:userFriendly]
  }
}
