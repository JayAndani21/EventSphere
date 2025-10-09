const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const participantController = require('../controllers/eventParticipantController');

// USER routes
router.post('/:eventId/join', auth, participantController.joinEvent);
router.delete('/:eventId/leave', auth, participantController.leaveEvent);

// ORGANIZER routes
router.get('/:eventId', auth, participantController.getEventParticipants);
router.post('/:eventId/add', auth, participantController.addParticipantByOrganizer);
router.delete('/:eventId/remove/:userId', auth, participantController.removeParticipantByOrganizer);

module.exports = router;
