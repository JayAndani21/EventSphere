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
  updateContestStatus,
  getPendingContests,
  approveContest,
  rejectContest
} = require('../controllers/contestController');

// Public routes
router.get('/', getAllContests);
router.get('/:id', auth, getContest);

// Organizer/Admin routes
router.post('/', auth, createContest);
router.get('/me/my-contests', auth, getMyContests);
router.put('/:id', auth, updateContest);
router.patch('/:id/status', auth, updateContestStatus); // ✅ Admin-only approval route
router.delete('/:id', auth, deleteContest);

// Admin-only routes for approval dashboard
router.get('/admin/pending', auth, getPendingContests); // Fetch all draft contests
router.patch('/:id/approve', auth, approveContest); // Approve a contest
router.patch('/:id/reject', auth, rejectContest);       // Reject contest 

// Participant routes
router.post('/:id/join', auth, joinContest);
router.post('/:id/leave', auth, leaveContest);
router.get('/:id/participants', auth, getContestParticipants);

module.exports = router;
