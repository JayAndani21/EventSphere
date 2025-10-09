const Contest = require('../models/contest.model');
const Question = require('../models/question.model');
const Participant = require('../models/participant.model');
const User = require('../models/User');

// ✅ Create new contest
exports.createContest = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    if (organizer.role !== 'organizer')
      return res.status(403).json({ message: 'Access denied. Only organizers can create contests.' });

    const { questions, ...contestData } = req.body;

    const contest = await Contest.create({
      ...contestData,
      organizer: organizer._id,
    });

    if (Array.isArray(questions) && questions.length > 0) {
      const createdQuestions = await Question.insertMany(
        questions.map(q => ({ ...q, contestId: contest._id }))
      );
      contest.questions = createdQuestions.map(q => q._id);
      await contest.save();
    }

    res.status(201).json({ message: 'Contest created successfully', contest });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create contest', error: error.message });
  }
};

// ✅ Get all contests (public only)
exports.getAllContests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { visibility: 'public', isActive: true };
    if (status) query.status = status;

    const contests = await Contest.find(query)
      .populate('organizer', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await Contest.countDocuments(query);
    res.json({
      contests,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contests', error: error.message });
  }
};

// ✅ Get contests created by current organizer
exports.getMyContests = async (req, res) => {
  try {
    const contests = await Contest.find({ organizer: req.user.id, isActive: true })
      .populate('organizer', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ contests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your contests', error: error.message });
  }
};

// ✅ Get single contest with its questions
exports.getContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id)
      .populate('organizer', 'fullName email')
      .populate('questions');

    if (!contest || !contest.isActive)
      return res.status(404).json({ message: 'Contest not found' });

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contest', error: error.message });
  }
};

// ✅ Update contest
exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.organizer.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Access denied: not your contest' });

    Object.assign(contest, req.body);
    await contest.save();

    res.json({ message: 'Contest updated successfully', contest });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update contest', error: error.message });
  }
};

// ✅ Soft delete contest
exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);

    if (!contest)
      return res.status(404).json({ message: 'Contest not found' });

    if (contest.organizer.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Access denied: not your contest' });

    contest.isActive = false;
    await contest.save();

    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete contest', error: error.message });
  }
};

// ✅ Join contest
exports.joinContest = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const contest = await Contest.findById(id);
    if (!contest || !contest.isActive)
      return res.status(404).json({ message: 'Contest not found' });

    if (contest.visibility === 'private' && password !== contest.password)
      return res.status(403).json({ message: 'Invalid password for private contest' });

    const existing = await Participant.findOne({ contestId: id, userId: req.user.id });
    if (existing)
      return res.status(400).json({ message: 'You already joined this contest' });

    await Participant.create({
      contestId: id,
      userId: req.user.id,
      userName: req.user.fullName,
      userEmail: req.user.email,
    });

    contest.stats.totalParticipants += 1;
    await contest.save();

    res.json({ message: 'Successfully joined contest' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to join contest', error: error.message });
  }
};

// ✅ Leave contest
exports.leaveContest = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const participant = await Participant.findOneAndDelete({ contestId: id, userId: req.user.id });
    if (!participant)
      return res.status(400).json({ message: 'You are not registered for this contest' });

    contest.stats.totalParticipants = Math.max(0, contest.stats.totalParticipants - 1);
    await contest.save();

    res.json({ message: 'Successfully left contest' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave contest', error: error.message });
  }
};

// ✅ Get contest participants (organizer only)
exports.getContestParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.organizer.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Access denied: only organizer can view participants' });

    const participants = await Participant.find({ contestId: id }).select('-__v');

    res.json({ participants, totalCount: participants.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};
