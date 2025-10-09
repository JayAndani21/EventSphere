const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const contestRoutes = require('./routes/contestRoutes'); // Add this line
const eventRoutes = require('./routes/eventRoutes');
const eventParticipantRoutes = require('./routes/eventParticipantRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const upload = multer({ dest: "uploads/" }); // temporary storage

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "events",
    });

    // ✅ Return JSON with image URL
    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cloudinary upload failed" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));


app.listen(5000, () => console.log("Server running on port 5000"));

app.use(express.json());

app.use('/api/events', eventRoutes);
app.use('/api/event-participants', eventParticipantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contests', require('./routes/contestRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));

app.use(errorMiddleware);

module.exports = app;