const Participant = require("../models/participant.model");
const Contest = require("../models/contest.model");
const User = require("../models/User");

// ✅ Register user for a contest
exports.registerParticipant = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    // ✅ 1. Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ 2. Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    // ✅ 3. Check if already registered
    const existing = await Participant.findOne({ contestId, userId });
    if (existing) return res.status(400).json({ message: "Already registered" });

    // ✅ 4. Register participant
    const participant = new Participant({
      contestId,
      userId,
      userName: user.fullName,
      userEmail: user.email,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await participant.save();

    // ✅ 5. Increment participant count in contest stats
    await Contest.findByIdAndUpdate(
      contestId,
      { $inc: { "stats.totalParticipants": 1 } },
      { new: true }
    );

    res.status(201).json({ message: "Registration successful", participant });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Unregister user from a contest
exports.unregisterParticipant = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    const participant = await Participant.findOneAndDelete({ contestId, userId });
    if (!participant) {
      return res.status(404).json({ message: "Not registered" });
    }

    // Decrease totalParticipants in contest
    await Contest.findByIdAndUpdate(contestId, {
      $inc: { "stats.totalParticipants": -1 },
    });

    res.status(200).json({ message: "Unregistered successfully" });
  } catch (error) {
    console.error("Error unregistering participant:", error);
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get all participants of a contest (Admin only)
exports.getParticipantsByContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const participants = await Participant.find({ contestId })
      .populate("userId", "name email")
      .sort({ score: -1, penalty: 1 });

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get contests a user registered for
exports.getUserContests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all participant entries for this user
    const participants = await Participant.find({ userId })
      .sort({ registeredAt: -1 })
      .lean(); // lean() gives plain JS objects

    // For each participant, fetch contest details
    const contestsWithTimes = await Promise.all(
      participants.map(async (p) => {
        const contest = await Contest.findById(p.contestId).lean();

        if (!contest) return null; // skip if contest not found

        return {
          ...p,
          contestId: {
            _id: contest._id,
            name: contest.name,
            startDate: contest.startDate,
            endDate: contest.endDate,
          },
        };
      })
    );

    // Remove nulls in case some contests are deleted
    const filtered = contestsWithTimes.filter(c => c !== null);

    res.json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update participant score (e.g., after a submission)
exports.updateScore = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { score, penalty, problemId, solved } = req.body;

    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    participant.score = score ?? participant.score;
    participant.penalty = penalty ?? participant.penalty;
    participant.lastActivityAt = new Date();

    if (problemId) {
      const problemIndex = participant.problems.findIndex(p => p.problemId.toString() === problemId);
      if (problemIndex >= 0) {
        participant.problems[problemIndex].solved = solved ?? participant.problems[problemIndex].solved;
      }
    }

    await participant.save();
    res.json({ message: "Score updated", participant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Disqualify participant
exports.disqualifyParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { reason } = req.body;

    const participant = await Participant.findByIdAndUpdate(
      participantId,
      { status: "disqualified", disqualifiedReason: reason },
      { new: true }
    );

    if (!participant) return res.status(404).json({ message: "Participant not found" });
    res.json({ message: "Participant disqualified", participant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Leaderboard (sorted by score and penalty)
exports.getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;
    const leaderboard = await Participant.find({ contestId, status: { $ne: "disqualified" } })
      .select("userName score penalty rank")
      .sort({ score: -1, penalty: 1 });

    leaderboard.forEach((p, i) => (p.rank = i + 1));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Remove participant (admin or contest owner)
exports.removeParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    const participant = await Participant.findByIdAndDelete(participantId);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    res.json({ message: "Participant removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
