const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['arduino', 'esp32', 'other'],
      default: 'arduino',
    },
    hardwareId: { type: String, trim: true },
    firmwareVersion: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date },
  },
  { timestamps: true },
);

deviceSchema.index({ userId: 1, hardwareId: 1 });

module.exports =
  mongoose.models.Device || mongoose.model('Device', deviceSchema);
