const Review = require("../models/review.model");
const Booking = require("../models/booking.model");
const Vehicle = require("../models/vehicle.model");
const paginate = require("../utils/paginate");

// Create a review
async function createReview(userId, bookingId, vehicleId, rating, comment) {
  const booking = await Booking.findOne({ _id: bookingId, customerId: userId });
  if (!booking) throw new Error("You are not allowed to review this booking");

  // --- Generate Review ID ---
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // e.g., 20251008

  // Count how many reviews were created today
  const count = await Review.countDocuments({
    createdAt: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999)),
    },
  });

  const sequence = String(count + 1).padStart(6, "0"); // 6 digits with leading zeros
  const reviewId = `REVIEW-${dateStr}-${sequence}`;

  // --- Create new Review ---
  const review = new Review({
    reviewId,
    bookingId,
    vehicleId,
    userId,
    rating,
    comment,
  });

  return await review.save();
}

// Update review (only the same user can update)
async function updateReview(userId, reviewId, updateData) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    updateData,
    { new: true }
  );
  if (!review) throw new Error("Review not found or not yours");
  return review;
}

// Delete review (only the same user can delete)
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

// Customer: get their own reviews
async function getReviewsByUser(userId) {
  return await Review.find({ userId })
    .populate("vehicleId", "name model")
    .populate("bookingId", "startDate endDate");
}

// Public: get reviews for a specific vehicle
async function getReviewsForVehicle(vehicleId) {
  return await Review.find({ vehicleId })
    .populate("userId", "firstName lastName")
    .populate("bookingId", "startDate endDate");
}
// Paginated versions using utils/paginate.js

async function getAllReviewsPaginated(page, limit) {
  return await paginate(Review, page, limit, {}, [
    { path: "userId", select: "firstName lastName" },
    { path: "vehicleId", select: "name model" }
  ]);
}

async function getReviewsForOwnerPaginated(ownerId, page, limit) {
  const vehicles = await Vehicle.find({ ownerId }).select("_id");
  const vehicleIds = vehicles.map(v => v._id);

  return await paginate(
    Review,
    page,
    limit,
    { vehicleId: { $in: vehicleIds } },
    [
      { path: "userId", select: "firstName lastName" },
      { path: "vehicleId", select: "name model" }
    ]
  );
}

async function getReviewsByUserPaginated(userId, page, limit) {
  return await paginate(
    Review,
    page,
    limit,
    { userId },
    [{ path: "vehicleId", select: "name model" }]
  );
}

async function getReviewsForVehiclePaginated(vehicleId, page, limit) {
  return await paginate(
    Review,
    page,
    limit,
    { vehicleId },
    [{ path: "userId", select: "firstName lastName" }]
  );
}


module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsForOwner,
  getAllReviews,
  adminDeleteReview,
  getReviewsByUser,
  getReviewsForVehicle,
  getAllReviewsPaginated,
  getReviewsForOwnerPaginated,
  getReviewsByUserPaginated,
  getReviewsForVehiclePaginated,
};
