import rateLimit from 'express-rate-limit';

export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 150 } = {}) {
  return rateLimit({ windowMs, max });
}
