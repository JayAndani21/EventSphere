const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  addQuestion,
  getQuestionsByContest,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

// Add and get questions for a contest
router.post('/:id/questions', auth, addQuestion);
router.get('/:id/questions', auth, getQuestionsByContest);

// Individual question operations
router.get('/single/:qid', getQuestionById);
router.put('/single/:qid', auth, updateQuestion);
router.delete('/single/:qid', auth, deleteQuestion);

module.exports = router;
