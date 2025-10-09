const mongoose = require('mongoose');

const eventParticipantSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true, trim: true },
  userEmail: { type: String, required: true, lowercase: true },
  status: {
    type: String,
    enum: ['registered', 'checked-in', 'cancelled'],
    default: 'registered'
  },
  registeredAt: { type: Date, default: Date.now },
  checkedInAt: { type: Date }
}, { timestamps: true });

// prevent duplicate
eventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('EventParticipant', eventParticipantSchema);
