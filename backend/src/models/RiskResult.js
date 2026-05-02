const mongoose = require('mongoose');

const riskResultSchema = new mongoose.Schema(
  {
    evaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evaluation',
      required: true,
      unique: true,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ['bajo', 'moderado', 'alto', 'muy_alto'],
      required: true,
    },
    yearsEstimated: { type: Number, min: 0 },
    confidence: { type: Number, min: 0, max: 1 },
    topFactors: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    aiModel: { type: String, default: 'v1.0' },
    generatedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.RiskResult ||
  mongoose.model('RiskResult', riskResultSchema);
