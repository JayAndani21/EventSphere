const Event = require('../models/event.model');
const User = require('../models/User');

// ✅ Create new event
exports.createEvent = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);
    if (!organizer) return res.status(404).json({ message: "Organizer not found" });

    const data = { ...req.body };

    // Remove empty optional fields for Online events
    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === null) delete data[key];
    });

    const event = new Event({
      ...data,
      status: "draft",
      organizer: organizer._id,
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
  console.error("Create Event Error:", error);
  res.status(400).json({ message: "Failed to create event", error: error.message });
}

};

// ✅ Get all public (published) events
exports.getAllEvents = async (req, res) => {
  try {
    const filter = {};

    // Optional query filter — e.g. ?status=draft
    if (req.query.status) filter.status = req.query.status;

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
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

// ✅ Update event — Organizer only
exports.updateEvent = async (req, res) => {
  try {
    // ✅ Only organizer can update events
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: "Access denied. Only organizers can update events." });
    }

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

// ✅ Soft Delete — Organizer only
exports.deleteEvent = async (req, res) => {
  try {
    // ✅ Only organizer can delete events
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: "Access denied. Only organizers can delete events." });
    }

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



// ✅ Admin: Approve event
exports.approveEvent = async (req, res) => {
  try {
    // only admin can approve
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admins only." });

    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Event not found" });

    if (event.status === "cancelled")
      return res.status(400).json({ message: "Cancelled events cannot be approved" });

    event.status = "published";
    await event.save();

    res.json({ message: "Event approved successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve event", error: error.message });
  }
};

// ✅ Admin: Reject event
exports.rejectEvent = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admins only." });

    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Event not found" });

    event.status = "cancelled";
    await event.save();

    res.json({ message: "Event rejected successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject event", error: error.message });
  }
};

