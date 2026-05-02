const mongoose = require('mongoose');

const frequencyScoreSchema = new mongoose.Schema(
  {
    hz: { type: Number, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    ear: { type: String, enum: ['left', 'right', 'both'], required: true },
  },
  { _id: false },
);

const habitDataSchema = new mongoose.Schema(
  {
    headphoneHours: { type: Number, min: 0 },
    volumeLevel: { type: Number, min: 0, max: 100 },
    noiseExposure: { type: Number, min: 0 },
    occupationRisk: { type: Number, min: 0, max: 100 },
    smoking: { type: Boolean, default: false },
  },
  { _id: false },
);

const evaluationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    frequencyScores: { type: [frequencyScoreSchema], default: [] },
    habitData: { type: habitDataSchema, default: {} },
    status: {
      type: String,
      enum: ['complete', 'partial'],
      default: 'partial',
    },
    takenAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

evaluationSchema.index({ userId: 1, takenAt: -1 });

module.exports =
  mongoose.models.Evaluation || mongoose.model('Evaluation', evaluationSchema);
