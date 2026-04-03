const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  text: String,
  events: Array,
  analysis: {
    label: String,
    confidence: Number,
    avgInterval: Number,
    pauseCount: Number,
    backspaceCount: Number,
    pasteCount: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Session", SessionSchema);
