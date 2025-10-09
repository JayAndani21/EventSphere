const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createContest,
  getAllContests,
  getMyContests,
  getContest,
  updateContest,
  deleteContest,
  joinContest,
  leaveContest,
  getContestParticipants,
} = require('../controllers/contestController');

// Public routes
router.get('/', getAllContests);
router.get('/:id', auth, getContest);

// Organizer routes
router.post('/', auth, createContest);
router.get('/me/my-contests', auth, getMyContests);
router.put('/:id', auth, updateContest);
router.delete('/:id', auth, deleteContest);

// Participant routes
router.post('/:id/join', auth, joinContest);
router.post('/:id/leave', auth, leaveContest);
router.get('/:id/participants', auth, getContestParticipants);

module.exports = router;
