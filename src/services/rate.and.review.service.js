const Review = require("../models/review.model");
const Booking = require("../models/booking.model");
const Vehicle = require("../models/vehicle.model");

async function createReview(userId, bookingId, vehicleId, rating, comment) {
  const booking = await Booking.findOne({ _id: bookingId, customerId: userId });
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

// Update review
async function updateReview(userId, reviewId, updateData) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    updateData,
    { new: true }
  );
  if (!review) throw new Error("Review not found or not yours");
  return review;
}

// Delete review
async function deleteReview(userId, reviewId) {
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!review) throw new Error("Review not found or not yours");
  return review;
}

// Owner: get reviews only for their vehicles
async function getReviewsForOwner(ownerId) {
  const vehicles = await Vehicle.find({ ownerId }).select("_id");
  const vehicleIds = vehicles.map(v => v._id);

  return await Review.find({ vehicleId: { $in: vehicleIds } })
    .populate("userId", "firstName lastName")
    .populate("vehicleId", "name model")
    .populate("bookingId", "startDate endDate");
}

// Admin: get all reviews
async function getAllReviews() {
  return await Review.find()
    .populate("userId", "firstName lastName")
    .populate("vehicleId", "name model")
    .populate("bookingId", "startDate endDate");
}

// Admin delete any review
async function adminDeleteReview(reviewId) {
  return await Review.findByIdAndDelete(reviewId);
}

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsForOwner,
  getAllReviews,
  adminDeleteReview,
};
