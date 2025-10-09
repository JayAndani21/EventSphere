const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', index: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, minlength: 50, maxlength: 5000 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  category: {
    type: String,
    enum: [
      'algorithms', 'data-structures', 'math', 'string', 'graph',
      'dynamic-programming', 'greedy', 'backtracking', 'simulation',
      'implementation', 'sorting', 'searching', 'geometry', 'number-theory'
    ],
    default: 'algorithms',
  },
  points: { type: Number, min: 1, max: 1000, default: 100 },
  timeLimit: { type: Number, min: 100, max: 10000, default: 1000 },
  memoryLimit: { type: Number, min: 16, max: 1024, default: 256 },
  constraints: { type: String, default: '' },
  followUp: { type: String, default: '' },
  sampleTestCases: { type: [testCaseSchema], required: true },
  hiddenTestCases: { type: [testCaseSchema], required: true },
  tags: [String],
  hints: [String],
  editorial: { type: String, default: '' },
  solutions: {
    python: { type: String, default: '' },
    javascript: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' },
    c: { type: String, default: '' },
    go: { type: String, default: '' },
    rust: { type: String, default: '' },
    kotlin: { type: String, default: '' },
  },
  authorNotes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
