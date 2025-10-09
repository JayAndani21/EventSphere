const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  password: {
    type: String,
    trim: true,
    minlength: 6,
    required: function () {
      return this.visibility === 'private';
    },
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationRequired: { type: Boolean, default: false },
  registrationDeadline: { type: Date },
  allowedLanguages: {
    type: [String],
    enum: ['python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust', 'kotlin'],
    required: true,
    default: ['python', 'javascript', 'cpp'],
  },
  maxSubmissions: { type: Number, min: 1, max: 200, default: 50 },
  penalty: { type: Number, min: 0, max: 60, default: 10 },
  showLeaderboard: { type: Boolean, default: true },
  prize: { type: String, trim: true, default: '' },
  rules: { type: String, trim: true, maxlength: 3000, default: '' },

  // Organizer
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Linked Questions
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft',
  },
  isActive: { type: Boolean, default: true },

  stats: {
    totalParticipants: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
