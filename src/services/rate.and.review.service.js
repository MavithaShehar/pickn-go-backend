const Review = require("../models/review.model");
const Booking = require("../models/booking.model");
const Vehicle = require("../models/vehicle.model");

//Create a new review (only if user booked this vehicle)

async function createReview(userId, bookingId, vehicleId, rating, comment) {
  // Verify booking belongs to this user
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) throw new Error("You are not allowed to review this booking");

  const review = new Review({
    bookingId,
    vehicleId,
    userId,
    rating,
    comment,
  });
  return await review.save();
}

//Update review (only if review belongs to user)
async function updateReview(userId, reviewId, updateData) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    updateData,
    { new: true }
  );
  if (!review) throw new Error("Review not found or not yours");
  return review;
}

//Delete review (customer can delete own review)
 
async function deleteReview(userId, reviewId) {
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!review) throw new Error("Review not found or not yours");
  return review;
}

/**
 * Get all reviews for a vehicle
 * - If owner, only their vehicles
 * - If admin, any vehicle
 */
async function getReviewsByVehicle(user, vehicleId) {
  // If user is owner, check ownership
  if (user.role === "owner") {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId: user.id });
    if (!vehicle) throw new Error("This vehicle does not belong to you");
  }

  return await Review.find({ vehicleId })
    .populate("userId", "firstName lastName")
    .populate("bookingId", "startDate endDate");
}

//Admin delete any review

async function adminDeleteReview(reviewId) {
  return await Review.findByIdAndDelete(reviewId);
}

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByVehicle,
  adminDeleteReview,
};
