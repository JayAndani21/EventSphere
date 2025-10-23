// app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventParticipantRoutes = require('./routes/eventParticipantRoutes');
const contestRoutes = require('./routes/contestRoutes');
const questionRoutes = require('./routes/questionRoutes');
const participantRoutes = require('./routes/participantRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const submissionRoutes = require("./routes/submissionRoutes");

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ✅ Cloudinary & Multer setup
const upload = multer({ dest: 'uploads/' }); // temporary storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Upload route
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'events'
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cloudinary upload failed' });
  }
});

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-participants', eventParticipantRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/participants', participantRoutes);
app.use("/api/submissions", submissionRoutes);


// ✅ Error handling
app.use(errorMiddleware);

module.exports = app;
