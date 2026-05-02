const mongoose = require('mongoose');

const noiseRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
    },
    dbLevel: { type: Number, required: true },
    riskTag: {
      type: String,
      enum: ['bajo', 'moderado', 'alto', 'muy_alto'],
      required: true,
    },
    source: {
      type: String,
      enum: ['iot', 'manual', 'app'],
      required: true,
    },
    location: { type: String, trim: true },
    highRisk: { type: Boolean, default: false },
    recordedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

noiseRecordSchema.index({ userId: 1, recordedAt: -1 });

module.exports =
  mongoose.models.NoiseRecord ||
  mongoose.model('NoiseRecord', noiseRecordSchema);
