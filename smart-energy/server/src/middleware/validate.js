import { validationResult } from 'express-validator';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({ field: e.param, message: e.msg }));
  return res.status(400).json({
    error: 'ValidationError',
    message: 'Please correct the highlighted fields.', // [REQ:Errors:userFriendly]
    details: formatted, // [REQ:Validation:*]
  });
}
