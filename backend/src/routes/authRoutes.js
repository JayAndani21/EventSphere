const express = require('express');
const router = express.Router();
const { getAllUsers, getUserStats, signup, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe); // <-- Add this line
// GET /api/users/stats
router.get('/stats', auth,getUserStats);
router.get('/usersdata', auth, getAllUsers);

module.exports = router;
