const Submission = require("../models/submission.model");
const Participant = require("../models/participant.model");
const Question = require("../models/question.model");
const { executeCode } = require("../services/pistonService");

/**
 * @desc Create and evaluate a submission using Piston API
 * @route POST /api/submissions
 */
exports.createSubmission = async (req, res) => {
  try {
    const { contestId, problemId, language, code } = req.body;
    const userId = req.user.id;

    if (!contestId || !problemId || !language || !code) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure participant exists
    const participant = await Participant.findOne({ contestId, userId });
    if (!participant) {
      return res.status(403).json({ message: "User not registered in this contest" });
    }

    // Retrieve problem and test cases
    const question = await Question.findById(problemId);
    if (!question) {
      return res.status(404).json({ message: "Problem not found" });
    }

    let verdict = "Accepted";
    let score = question.points;
    const testResults = [];

    // Run all hidden test cases
    for (const test of question.hiddenTestCases) {
      const result = await executeCode(language, code, test.input);
      const output = (result.output || "").trim();
      const expected = (test.output || "").trim();

      testResults.push({
        input: test.input,
        expected,
        output,
        pass: output === expected,
      });

      if (output !== expected) {
        verdict = "Wrong Answer";
        score = 0;
        break;
      }
    }

    // Create submission record
    const submission = new Submission({
      contestId,
      problemId,
      participantId: participant._id,
      userId,
      userName: req.user.fullName,
      language,
      code,
      verdict,
      score,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await submission.save();

    // Update participant stats
    participant.submissionsCount = (participant.submissionsCount || 0) + 1;
    participant.lastActivityAt = new Date();
    await participant.save();

    res.status(201).json({
      message: "Submission evaluated successfully",
      verdict,
      score,
      testResults,
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Error evaluating submission:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Execute code without storing (practice mode)
 * @route POST /api/submissions/run
 */
exports.runCode = async (req, res) => {
  try {
    const { language, code, stdin } = req.body;
    if (!language || !code)
      return res.status(400).json({ message: "Language and code required" });

    const result = await executeCode(language, code, stdin || "");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Execution error", error: error.message });
  }
};

/**
 * @desc Get all submissions for a contest
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
 * @desc Get submissions for a specific problem
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
 * @desc Get current user’s submissions in a contest
 */
exports.getMySubmissions = async (req, res) => {
  try {
    const { contestId } = req.params;
    const submissions = await Submission.find({ contestId, userId: req.user.id })
      .populate("problemId", "title")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user submissions", error: error.message });
  }
};

/**
 * @desc Get a single submission by ID
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("problemId", "title")
      .populate("userId", "name email");

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submission", error: error.message });
  }
};
