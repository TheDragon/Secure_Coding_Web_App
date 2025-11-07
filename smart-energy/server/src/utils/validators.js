import { body, param, query } from 'express-validator';

export const registerValidator = [
  body('username').notEmpty().withMessage('Username required'), // [REQ:Validation:presence]
  body('username').isLength({ min: 3, max: 32 }).withMessage('3-32 chars'), // [REQ:Validation:range]
  body('username').matches(/^[a-z0-9._-]+$/).withMessage('Invalid format'), // [REQ:Validation:format]
  body('email').isEmail().withMessage('Valid email required'), // [REQ:Validation:format]
  body('password').isLength({ min: 8 }).withMessage('Min 8 chars'), // [REQ:Validation:range]
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const forgotValidator = [body('email').isEmail().withMessage('Valid email required')];
export const resetValidator = [
  body('token').notEmpty().withMessage('Token required'), // [REQ:Validation:presence]
  body('password').isLength({ min: 8 }).withMessage('Min 8 chars'),
];

export const householdCreateValidator = [body('name').notEmpty().withMessage('Name required')]; // [REQ:Validation:presence]

export const meterCreateValidator = [
  body('householdId').isMongoId().withMessage('householdId required'),
  body('type').isIn(['electricity', 'water']).withMessage('Invalid type'),
  body('unit').isIn(['kWh', 'L']).withMessage('Invalid unit'),
  body('label').notEmpty().withMessage('Label required'),
];

export const readingCreateValidator = [
  body('meterId').isMongoId().withMessage('meterId required'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be >= 0'), // [REQ:Validation:numeric] [REQ:Validation:range]
  body('recordedAt').isISO8601().withMessage('Invalid date'),
];

export const readingsQueryValidator = [
  param('meterId').isMongoId().withMessage('meterId required'),
  query('from').optional().isISO8601().withMessage('Invalid from date'),
  query('to').optional().isISO8601().withMessage('Invalid to date'),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page>=1'), // [REQ:Validation:numeric] [REQ:Validation:range]
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('1-100'),
];

export const goalValidator = [
  body('householdId').isMongoId().withMessage('householdId required'),
  body('meterType').isIn(['electricity', 'water']).withMessage('Invalid meterType'),
  body('period').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid period'),
  body('limit').isFloat({ gt: 0 }).withMessage('Limit must be > 0'), // [REQ:Validation:numeric] [REQ:Validation:range]
];

export const alertAckValidator = [body('status').isIn(['acknowledged']).withMessage('Invalid status')];
