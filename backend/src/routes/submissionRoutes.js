const express = require("express");
const router = express.Router();
const {
  createSubmission,
  getSubmissionsByContest,
  getSubmissionsByProblem,
  getMySubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");
const auth  = require("../middleware/authMiddleware");

// 🔒 Auth required for all submission routes
router.post("/", auth, createSubmission);
router.get("/contest/:contestId", auth, getSubmissionsByContest);
router.get("/problem/:problemId", auth, getSubmissionsByProblem);
router.get("/my/:contestId", auth, getMySubmissions);
router.get("/:id", auth, getSubmissionById);

module.exports = router;
