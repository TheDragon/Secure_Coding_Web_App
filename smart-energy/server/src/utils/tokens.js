import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
import env from '../config/env.js';

const REFRESH_MS = env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshSession(userId, req) {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_MS);
  const doc = await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
  return { rawToken, session: doc };
}

export async function rotateRefreshSession(oldSession, req) {
  await RefreshToken.deleteOne({ _id: oldSession._id });
  return createRefreshSession(oldSession.userId, req);
}

export async function findSessionByToken(rawToken) {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);
  return RefreshToken.findOne({ tokenHash });
}

export async function revokeSessionById(sessionId) {
  if (!sessionId) return;
  await RefreshToken.deleteOne({ _id: sessionId });
}

export async function revokeSessionsByUser(userId) {
  if (!userId) return;
  await RefreshToken.deleteMany({ userId });
}

export const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: REFRESH_MS,
  path: '/',
};

export function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, refreshCookieOptions);
}

export function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: 0 });
}

export { hashToken };
