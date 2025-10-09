const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  register,
  getParticipants,
  removeParticipant
} = require('../controllers/participantController');

// Register for contest
router.post('/:id/register', auth, register);

// Get participants (organizer only)
router.get('/:id/participants', auth, getParticipants);

// Remove participant (organizer only)
router.delete('/:id/participants/:userId', auth, removeParticipant);

module.exports = router;
