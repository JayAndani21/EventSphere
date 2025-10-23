const Question = require('../models/question.model');
const Contest = require('../models/contest.model');

// ✅ Add a new question to a contest
exports.addQuestion = async (req, res) => {
  try {
    const { id } = req.params; // contestId
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    // Only the organizer can add questions
    if (contest.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add questions' });
    }

    const question = await Question.create({ ...req.body, contestId: id });
    contest.questions.push(question._id);
    await contest.save();

    res.status(201).json({ message: 'Question added successfully', question });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add question', error: error.message });
  }
};

// ✅ Get all questions for a contest
exports.getQuestionsByContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const questions = await Question.find({ contestId });

    if (!questions || questions.length === 0)
      return res.status(404).json({ message: 'No questions found for this contest' });

    res.status(200).json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions', error: err.message });
  }
};


// ✅ Get a single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const { qid } = req.params;
    const question = await Question.findById(qid);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch question', error: error.message });
  }
};

// ✅ Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { qid } = req.params;
    const question = await Question.findById(qid);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const contest = await Contest.findById(question.contestId);
    if (!contest || contest.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update question' });
    }

    Object.assign(question, req.body);
    await question.save();

    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update question', error: error.message });
  }
};

// ✅ Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { qid } = req.params;
    const question = await Question.findById(qid);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const contest = await Contest.findById(question.contestId);
    if (!contest || contest.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete question' });
    }

    await Question.findByIdAndDelete(qid);
    contest.questions = contest.questions.filter(q => q.toString() !== qid);
    await contest.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question', error: error.message });
  }
};
