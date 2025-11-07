import mongoose from '../db/mongoose.js';
import { sanitizeString } from '../middleware/sanitize.js';

const alertSchema = new mongoose.Schema(
  {
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: { type: String, enum: ['open', 'acknowledged'], default: 'open' },
    message: { type: String, set: (v) => (typeof v === 'string' ? sanitizeString(v) : v) }, // [REQ:XSS:validate]
  },
  { timestamps: true }
);

// Ensure a single alert per goal per period
alertSchema.index({ goalId: 1, periodStart: 1, periodEnd: 1 }, { unique: true });
// Common query pattern
alertSchema.index({ householdId: 1, status: 1, periodStart: -1 });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
