const Participant = require('../models/participant.model');
const Contest = require('../models/contest.model');

// ✅ Register (join) a contest
exports.register = async (req, res) => {
  try {
    const { id } = req.params; // contestId
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    // Prevent late registration
    if (contest.registrationDeadline && new Date() > contest.registrationDeadline)
      return res.status(400).json({ message: 'Registration deadline has passed' });

    const exists = await Participant.findOne({ contestId: id, userId: req.user.id });
    if (exists) return res.status(400).json({ message: 'Already registered' });

    const participant = await Participant.create({
      contestId: id,
      userId: req.user.id,
      userName: req.user.fullName,
      userEmail: req.user.email,
    });

    contest.stats.totalParticipants += 1;
    await contest.save();

    res.status(201).json({ message: 'Registered successfully', participant });
  } catch (error) {
    res.status(400).json({ message: 'Failed to register', error: error.message });
  }
};

// ✅ Get participants of a contest (organizer only)
exports.getParticipants = async (req, res) => {
  try {
    const { id } = req.params; // contestId
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.organizer.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Access denied: only organizer can view participants' });

    const participants = await Participant.find({ contestId: id }).sort({ registeredAt: -1 });
    res.json({ participants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};

// ✅ Remove participant (organizer action)
exports.removeParticipant = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.organizer.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Access denied' });

    const removed = await Participant.findOneAndDelete({ contestId: id, userId });
    if (!removed) return res.status(404).json({ message: 'Participant not found' });

    contest.stats.totalParticipants = Math.max(0, contest.stats.totalParticipants - 1);
    await contest.save();

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove participant', error: error.message });
  }
};
