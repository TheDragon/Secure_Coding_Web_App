import mongoose from '../db/mongoose.js';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // [REQ:Validation:presence]
      minlength: 3,
      maxlength: 32,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9._-]+$/, // [REQ:Validation:format]
      unique: true, // [REQ:Validation:uniqueness]
    },
    email: {
      type: String,
      required: true, // [REQ:Validation:presence]
      lowercase: true,
      trim: true,
      unique: true, // [REQ:Validation:uniqueness]
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // [REQ:Validation:format]
    },
    passwordHash: { type: String, required: true }, // [REQ:Auth:usernamePassword]
    role: { type: String, enum: ['admin', 'user'], default: 'user' }, // [REQ:Auth:userRoles]
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash); // [REQ:Auth:usernamePassword]
};

userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt); // [REQ:Auth:usernamePassword]
  }
  next();
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
