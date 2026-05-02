const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    age: { type: Number, min: 0, max: 120 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_say'],
    },
    occupation: { type: String, trim: true },
    city: { type: String, trim: true },
    settings: {
      reminders: { type: Boolean, default: true },
      darkTheme: { type: Boolean, default: true },
      volumeUnit: { type: String, enum: ['dba', 'dbc'], default: 'dba' },
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    refreshTokenHash: { type: String, default: null, select: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function savePasswordHash() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

/**
 * @param {string} candidate
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const safe = { ...ret };
    delete safe.password;
    delete safe.refreshTokenHash;
    if (safe._id) {
      safe.id = safe._id.toString();
      delete safe._id;
    }
    delete safe.__v;
    return safe;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
