import logger from '../config/logger.js';

export function errorHandler(err, req, res, _next) {
  const log = req?.log || logger;
  log.error('Unhandled error', { path: req.path, message: err.message, requestId: req.id });
  const status = err.status || 500;
  const message = status >= 500 ? 'An unexpected error occurred.' : err.message;
  res.status(status).json({ message, requestId: req.id }); // [REQ:Errors:userFriendly]
}
