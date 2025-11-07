import mongoose from '../db/mongoose.js';

const goalSchema = new mongoose.Schema(
  {
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
    meterType: { type: String, enum: ['electricity', 'water'], required: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    limit: { type: Number, required: true, min: 0.000001 }, // [REQ:Validation:numeric] [REQ:Validation:range]
  },
  { timestamps: true }
);

// For quick lookup of goals for a given household/type/period
goalSchema.index({ householdId: 1, meterType: 1, period: 1 });

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
