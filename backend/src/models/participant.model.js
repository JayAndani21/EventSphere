const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },

    // Registration status
    status: {
      type: String,
      enum: ["registered", "active", "completed", "disqualified"],
      default: "registered",
    },

    // Contest scoring
    score: { type: Number, default: 0 },
    rank: { type: Number, default: null },
    submissionsCount: { type: Number, default: 0 },

    // Track per-problem performance
    problems: [
      {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        solved: { type: Boolean, default: false },
        bestSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
        attempts: { type: Number, default: 0 },
        lastSubmissionTime: { type: Date },
        timeTaken: { type: Number, default: 0 }, // in seconds or minutes since contest start
        score: { type: Number, default: 0 }, // if partial scoring is supported
      },
    ],

    // Contest timing
    registeredAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },

    // Anti-cheating / fairness
    ipAddress: { type: String },
    userAgent: { type: String },
    disqualifiedReason: { type: String },

    // Live leaderboard helpers
    lastActivityAt: { type: Date, default: Date.now },
    penalty: { type: Number, default: 0 }, // like Codeforces-style time penalties

    // Optional: for team contests
    teamName: { type: String },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Prevent duplicate registrations for same contest
participantSchema.index({ contestId: 1, userId: 1 }, { unique: true });

// Useful for leaderboard sorting
participantSchema.index({ contestId: 1, score: -1, penalty: 1 });

module.exports = mongoose.model("Participant", participantSchema);
