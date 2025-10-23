const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");
const auth  = require("../middleware/authMiddleware");

// User routes
router.post("/:contestId/register", auth, participantController.registerParticipant);
router.delete("/:contestId/unregister", auth, participantController.unregisterParticipant);
router.get("/my-contests", auth, participantController.getUserContests);

// Admin / contest owner routes
router.get("/:contestId/all", auth, participantController.getParticipantsByContest);
router.put("/:participantId/update-score", auth, participantController.updateScore);
router.put("/:participantId/disqualify", auth, participantController.disqualifyParticipant);
router.delete("/:participantId/remove", auth, participantController.removeParticipant);
router.get("/:contestId/leaderboard", auth, participantController.getLeaderboard);

module.exports = router;
