const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["car", "bike", "truck", "van"], // Example enum for vehicle types; adjust as needed
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Vehicle", searchSchema); // Collection name: "vehicles"