import mongoose from '../db/mongoose.js';
import { sanitizeString } from '../middleware/sanitize.js';

const householdSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // [REQ:Validation:presence]
    address: {
      type: String,
      set: (v) => (typeof v === 'string' ? sanitizeString(v) : v), // [REQ:XSS:validate]
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Household = mongoose.model('Household', householdSchema);
export default Household;
