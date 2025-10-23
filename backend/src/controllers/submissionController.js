const Submission = require("../models/submission.model");
const Participant = require("../models/participant.model");
const Question = require("../models/question.model");

/**
 * @desc Create a new submission
 * @route POST /api/submissions
 */
exports.createSubmission = async (req, res) => {
  try {
    const { contestId, problemId, language, code } = req.body;
    const userId = req.user._id; // assuming authMiddleware sets req.user

    if (!contestId || !problemId || !language || !code) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const participant = await Participant.findOne({ contestId, userId });
    if (!participant) {
      return res.status(403).json({ message: "User not registered in this contest" });
    }

    const submission = new Submission({
      contestId,
      problemId,
      participantId: participant._id,
      userId,
      userName: req.user.name,
      language,
      code,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await submission.save();

    // Increment submission count for participant
    participant.submissionsCount += 1;
    participant.lastActivityAt = new Date();
    await participant.save();

    // TODO: send submission to judge queue here (if you implement online judging)
    // e.g., await judgeQueue.add({ submissionId: submission._id });

    return res.status(201).json({ message: "Submission created successfully", submission });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all submissions for a contest
 * @route GET /api/submissions/contest/:contestId
 */
exports.getSubmissionsByContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const submissions = await Submission.find({ contestId })
      .populate("problemId", "title")
      .populate("userId", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

/**
 * @desc Get all submissions for a problem (optionally filtered by user)
 * @route GET /api/submissions/problem/:problemId
 */
exports.getSubmissionsByProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { contestId, userId } = req.query;

    const filter = { problemId };
    if (contestId) filter.contestId = contestId;
    if (userId) filter.userId = userId;

    const submissions = await Submission.find(filter)
      .populate("userId", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

/**
 * @desc Get all submissions by current user in a contest
 * @route GET /api/submissions/my/:contestId
 */
exports.getMySubmissions = async (req, res) => {
  try {
    const { contestId } = req.params;
    const submissions = await Submission.find({ contestId, userId: req.user._id })
      .populate("problemId", "title")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user submissions", error: error.message });
  }
};

/**
 * @desc Get single submission details
 * @route GET /api/submissions/:id
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("problemId", "title")
      .populate("userId", "name email");

    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submission", error: error.message });
  }
};
