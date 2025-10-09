const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: {
    type: String,
    enum: ['registered', 'active', 'completed', 'disqualified'],
    default: 'registered'
  },
  score: { type: Number, default: 0 },
  submissionsCount: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

participantSchema.index({ contestId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Participant', participantSchema);
