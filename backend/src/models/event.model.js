const mongoose = require('mongoose');

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"];
const TICKET_TYPES = ["Paid", "Unpaid"];

const eventSchema = new mongoose.Schema({
  // 🔹 Basic Info
  eventName: {
    type: String,
    required: [true, "Event name is required"],
    trim: true,
    maxlength: 150,
  },
  eventType: {
    type: String,
    enum: ["Online", "Offline"],
    required: [true, "Event type is required"],
  },
  category: {
    type: String,
    trim: true,
    maxlength: 100,
  },

  // 🔹 Date & Time
  date: {
    type: Date,
    required: [true, "Event date is required"],
  },
  time: {
    type: String,
    required: [true, "Event time is required"],
  },

  // 🔹 Offline Event Details
  venueName: {
    type: String,
    trim: true,
    required: function () {
      return this.eventType === "Offline";
    },
  },
  address: {
    type: String,
    trim: true,
    maxlength: 500,
    required: function () {
      return this.eventType === "Offline";
    },
  },
  city: {
    type: String,
    trim: true,
    required: function () {
      return this.eventType === "Offline";
    },
  },
  state: {
    type: String,
    trim: true,
    required: function () {
      return this.eventType === "Offline";
    },
  },

  // 🔹 Ticketing & Capacity
  capacity: {
    type: Number,
    min: 1,
    required: function () {
      return this.eventType === "Offline";
    },
  },
  ticketType: {
    type: String,
    enum: TICKET_TYPES,
    required: function () {
      return this.eventType === "Offline";
    },
  },
  ticketPrice: {
    type: Number,
    min: 0,
    required: function () {
      return this.ticketType === "Paid";
    },
  },

  // 🔹 Meal Options
  mealOptions: {
    type: [String],
    enum: MEAL_OPTIONS,
    default: [],
  },

  // 🔹 Organizer Info
  organizerName: {
    type: String,
    required: [true, "Organizer name is required"],
    trim: true,
  },
  organizerEmail: {
    type: String,
    required: [true, "Organizer email is required"],
    lowercase: true,
    match: [/.+\@.+\..+/, "Invalid email format"],
  },
  organizerPhone: {
    type: String,
    required: [true, "Organizer phone number is required"],
    match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
  },

  // 🔹 Cover Image
  coverImageUrl: {
    type: String,
    trim: true,
    default: "",
  },

  // 🔹 Organizer Reference
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // 🔹 Status & Metadata
  status: {
    type: String,
    enum: ["draft", "published", "cancelled", "completed"],
    default: "draft",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  attendeesCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Virtuals
eventSchema.virtual("isOffline").get(function () {
  return this.eventType === "Offline";
});

// Hooks
eventSchema.pre("save", function (next) {
  if (this.date < new Date() && this.status === "published") {
    this.status = "completed";
  }
  next();
});

// Indexes
eventSchema.index({ eventType: 1, date: 1 });
eventSchema.index({ organizer: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);
