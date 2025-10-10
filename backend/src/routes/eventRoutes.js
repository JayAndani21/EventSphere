const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventController');

// Event CRUD
router.post('/', auth, eventController.createEvent);
router.get('/all', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
    