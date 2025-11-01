const Contest = require('../models/contest.model');
const Question = require('../models/question.model');
const Participant = require('../models/participant.model');
const User = require('../models/User');

// ✅ Create new contest (always saved as draft)
exports.createContest = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    if (organizer.role !== 'organizer' && organizer.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Only organizers or admins can create contests.' });

    const { questions, ...contestData } = req.body;

    // Enforce draft status regardless of frontend data
    contestData.status = 'draft';

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

    res.status(201).json({ message: 'Contest saved as draft successfully', contest });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create contest', error: error.message });
  }
};

// ✅ Get all contests (users only see published)
exports.getAllContests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { visibility: 'public', isActive: true, status: 'published' };

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

// ✅ Get single contest
exports.getContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id)
      .populate('organizer', 'fullName email')
      .populate('questions');

    if (!contest || !contest.isActive)
      return res.status(404).json({ message: 'Contest not found' });

    // Users can view only published contests
    if (
      contest.status !== 'published' &&
      req.user.role !== 'admin' &&
      contest.organizer.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: 'You are not authorized to view this contest' });
    }

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contest', error: error.message });
  }
};

// ✅ Update contest (organizer or admin)
exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.organizer.toString() !== req.user.id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied: not your contest' });

    // Prevent organizers from changing status directly
    const updates = { ...req.body };
    if (req.user.role !== 'admin') delete updates.status;

    Object.assign(contest, updates);
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

    if (contest.organizer.toString() !== req.user.id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied: not your contest' });

    contest.isActive = false;
    await contest.save();

    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete contest', error: error.message });
  }
};

// ✅ Admin-only: Update contest status
exports.updateContestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'completed', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin')
      return res.status(403).json({ message: 'Access denied: Admins only' });

    const contest = await Contest.findById(id);
    if (!contest)
      return res.status(404).json({ message: 'Contest not found' });

    contest.status = status;
    await contest.save();

    res.json({ message: `Contest status updated to ${status}`, contest });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update contest status', error: error.message });
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

    if (contest.status !== 'published')
      return res.status(403).json({ message: 'Contest not open for participation' });

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

// ✅ Get participants (organizer or admin)
exports.getContestParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.organizer.toString() !== req.user.id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied: only organizer or admin can view participants' });

    const participants = await Participant.find({ contestId: id }).select('-__v');

    res.json({ participants, totalCount: participants.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};

// ✅ Get all pending contests (draft) — Admin only
exports.getPendingContests = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });

    const contests = await Contest.find({ status: 'draft', isActive: true })
      .populate('organizer', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: contests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending contests', error: error.message });
  }
};

// ✅ Approve contest (change status → published) — Admin only
exports.approveContest = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });

    const contest = await Contest.findById(id);
    if (!contest)
      return res.status(404).json({ success: false, message: 'Contest not found' });

    contest.status = 'published';
    await contest.save();

    res.json({ success: true, message: 'Contest approved and published successfully', contest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve contest', error: error.message });
  }
};

// ✅ Reject contest (status → cancelled) — Admin only
exports.rejectContest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });

    const contest = await Contest.findById(id);
    if (!contest)
      return res.status(404).json({ success: false, message: 'Contest not found' });

    contest.status = 'cancelled';
    if (comment) contest.rejectionReason = comment; // optional field if you want to store reason
    await contest.save();

    res.json({ success: true, message: 'Contest rejected successfully', contest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject contest', error: error.message });
  }
};

