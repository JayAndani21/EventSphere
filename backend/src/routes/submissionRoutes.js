const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createSubmission,
  runCode,
  getSubmissionsByContest,
  getSubmissionsByProblem,
  getMySubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");

router.post("/run", auth, runCode);
router.post("/", auth, createSubmission);
router.get("/contest/:contestId", auth, getSubmissionsByContest);
router.get("/problem/:problemId", auth, getSubmissionsByProblem);
router.get("/my/:contestId", auth, getMySubmissions);
router.get("/:id", auth, getSubmissionById);

module.exports = router;
