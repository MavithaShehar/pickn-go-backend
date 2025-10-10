const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewId: { type: String, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who wrote the review
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
