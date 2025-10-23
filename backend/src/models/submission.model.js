const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, index: true },

    participantId: { type: mongoose.Schema.Types.ObjectId, ref: "Participant", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },

    language: {
      type: String,
      enum: ["cpp", "cpp17", "cpp20", "python3", "java", "javascript", "go", "rust"],
      required: true,
    },
    code: { type: String, required: true },

    verdict: {
      type: String,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        "Pending",
        "Running",
      ],
      default: "Pending",
    },
    score: { type: Number, default: 0 },
    timeUsed: { type: Number, default: 0 },
    memoryUsed: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },

    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

submissionSchema.index({ contestId: 1, problemId: 1 });
submissionSchema.index({ userId: 1, contestId: 1 });
submissionSchema.index({ participantId: 1, contestId: 1 });
submissionSchema.index({ verdict: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
