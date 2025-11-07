import logger from '../config/logger.js';

export function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error', { path: req.path, message: err.message });
  const status = err.status || 500;
  const message = status >= 500 ? 'An unexpected error occurred.' : err.message;
  res.status(status).json({ message }); // [REQ:Errors:userFriendly]
}
