const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["profile", "vehicle"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Image", imageSchema);
