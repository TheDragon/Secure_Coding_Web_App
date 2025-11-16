import { randomUUID } from 'crypto';
import logger from '../config/logger.js';

export function requestId(req, res, next) {
  const id = randomUUID();
  req.id = id;
  res.locals.requestId = id;
  res.setHeader('X-Request-ID', id);
  req.log = typeof logger.child === 'function' ? logger.child({ requestId: id }) : logger;
  next();
}
