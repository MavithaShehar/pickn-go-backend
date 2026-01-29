const mongoose = require("mongoose");
const { createAlert } = require('../services/alert.service');

const reviewSchema = new mongoose.Schema({
  reviewId: { type: String, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who wrote the review
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
}, { timestamps: true });

reviewSchema.post("save", async function (doc) {

      await createAlert({
        bookingId: doc.bookingId,
        vehicleId: doc.vehicleId,
        customerId: doc.userId,  // reviewer
        reviewId: doc._id,       // ✅ Include reviewId
        message: `Your review (ID: ${doc.reviewId}) for the vehicle has been submitted successfully.`
      });
});

module.exports = mongoose.model("Review", reviewSchema);
