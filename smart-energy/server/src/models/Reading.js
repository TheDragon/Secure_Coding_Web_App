import mongoose from '../db/mongoose.js';
import { sanitizeString } from '../middleware/sanitize.js';

const readingSchema = new mongoose.Schema(
  {
    meterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meter', required: true },
    value: { type: Number, required: true, min: 0 }, // [REQ:Validation:numeric] [REQ:Validation:range]
    recordedAt: { type: Date, required: true },
    source: { type: String, enum: ['manual', 'api'], default: 'manual' },
    notes: { type: String, set: (v) => (typeof v === 'string' ? sanitizeString(v) : v) }, // [REQ:XSS:validate]
  },
  { timestamps: true }
);

// Efficient time-range queries per meter // [REQ:NoSQLi:parameterized]
readingSchema.index({ meterId: 1, recordedAt: -1 });

const Reading = mongoose.model('Reading', readingSchema);
export default Reading;
