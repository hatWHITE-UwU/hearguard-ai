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
    /** Clave para POST /api/noise/iot (Fase 5); no exponer en listados públicos */
    apiKey: { type: String, select: false, sparse: true },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date },
  },
  { timestamps: true },
);

deviceSchema.index({ userId: 1, hardwareId: 1 });

deviceSchema.set('toJSON', {
  transform(_doc, ret) {
    const safe = { ...ret };
    delete safe.apiKey;
    if (safe._id) {
      safe.id = safe._id.toString();
      delete safe._id;
    }
    delete safe.__v;
    return safe;
  },
});

module.exports =
  mongoose.models.Device || mongoose.model('Device', deviceSchema);
