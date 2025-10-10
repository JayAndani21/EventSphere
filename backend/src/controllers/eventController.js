const Event = require('../models/event.model');
const User = require('../models/User');

// ✅ Create new event
exports.createEvent = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);
    if (!organizer) return res.status(404).json({ message: "Organizer not found" });

    const event = new Event({
      ...req.body,
      organizer: organizer._id
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create event", error: error.message });
  }
};

// ✅ Get all public (published) events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
    .populate('organizer', 'fullName email')
    .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

// ✅ Get single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName email');

    if (!event || !event.isActive)
      return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error: error.message });
  }
};

// ✅ Update event (Organizer only)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user.id
    });

    if (!event)
      return res.status(404).json({ message: "Event not found or unauthorized" });

    Object.assign(event, req.body);
    await event.save();

    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(400).json({ message: "Failed to update event", error: error.message });
  }
};

// ✅ Delete (soft delete)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user.id
    });

    if (!event)
      return res.status(404).json({ message: "Event not found or unauthorized" });

    event.isActive = false;
    await event.save();

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};
