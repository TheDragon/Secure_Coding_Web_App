import mongoose from '../db/mongoose.js';

const meterSchema = new mongoose.Schema(
  {
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
    type: { type: String, enum: ['electricity', 'water'], required: true },
    unit: { type: String, enum: ['kWh', 'L'], required: true },
    label: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Unique label per household // [REQ:Validation:uniqueness]
meterSchema.index({ householdId: 1, label: 1 }, { unique: true });

const Meter = mongoose.model('Meter', meterSchema);
export default Meter;
