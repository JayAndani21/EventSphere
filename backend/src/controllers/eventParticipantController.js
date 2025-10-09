const Event = require('../models/event.model');
const EventParticipant = require('../models/eventParticipant.model');
const User = require('../models/User');

/**
 * USER: Join Event
 */
exports.joinEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event || !event.isActive)
      return res.status(404).json({ message: 'Event not found' });

    if (event.status !== 'published')
      return res.status(400).json({ message: 'Event is not open for registration' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add participant
    const participant = await EventParticipant.create({
      eventId,
      userId,
      userName: user.fullName,
      userEmail: user.email
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { attendeesCount: 1 } });

    res.status(201).json({
      message: 'You have successfully joined the event',
      participant
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: 'You are already registered for this event' });

    res.status(500).json({ message: error.message });
  }
};

/**
 * USER: Leave (Unregister) Event
 */
exports.leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const participant = await EventParticipant.findOneAndDelete({ eventId, userId });
    if (!participant)
      return res.status(404).json({ message: 'You are not registered for this event' });

    await Event.findByIdAndUpdate(eventId, { $inc: { attendeesCount: -1 } });

    res.json({ message: 'You have successfully unregistered from the event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ORGANIZER: View Participants
 */
exports.getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied: Organizer only' });

    const participants = await EventParticipant.find({ eventId })
      .select('-__v')
      .sort({ registeredAt: -1 });

    res.json({
      totalCount: participants.length,
      participants
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ORGANIZER: Add participant manually
 */
exports.addParticipantByOrganizer = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { userEmail, userName } = req.body;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    // Optional: Check if User exists in DB
    let user = await User.findOne({ email: userEmail });
    let userId = user ? user._id : null;

    const participant = await EventParticipant.create({
      eventId,
      userId,
      userName,
      userEmail,
      status: 'registered'
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { attendeesCount: 1 } });

    res.status(201).json({
      message: 'Participant added successfully by organizer',
      participant
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: 'User already registered' });
    res.status(500).json({ message: error.message });
  }
};

/**
 * ORGANIZER: Remove participant
 */
exports.removeParticipantByOrganizer = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.params.userId;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    const participant = await EventParticipant.findOneAndDelete({ eventId, userId });
    if (!participant)
      return res.status(404).json({ message: 'Participant not found' });

    await Event.findByIdAndUpdate(eventId, { $inc: { attendeesCount: -1 } });

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
