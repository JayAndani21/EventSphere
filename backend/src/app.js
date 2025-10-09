const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const contestRoutes = require('./routes/contestRoutes'); // Add this line
const errorMiddleware = require('./middleware/errorMiddleware');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/contests', require('./routes/contestRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));

app.use(errorMiddleware);

module.exports = app;