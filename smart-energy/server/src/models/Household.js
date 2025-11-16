import mongoose from '../db/mongoose.js';
import { sanitizeString } from '../middleware/sanitize.js';
import { encryptField, decryptField } from '../utils/encryption.js';

const householdSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // [REQ:Validation:presence]
    contactEmail: {
      type: String,
      required: true,
      get: decryptField,
      set: (v) => (typeof v === 'string' ? encryptField(v.trim().toLowerCase()) : v),
    }, // [REQ:Validation:format]
    address: {
      type: String,
      get: decryptField,
      set: (v) => (typeof v === 'string' && v.trim() ? encryptField(sanitizeString(v)) : undefined), // [REQ:XSS:validate]
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

householdSchema.set('toJSON', { getters: true, virtuals: true });
householdSchema.set('toObject', { getters: true, virtuals: true });

const Household = mongoose.model('Household', householdSchema);
export default Household;
