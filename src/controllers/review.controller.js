const reviewService = require("../services/review.service");


// Create review (customer only)
exports.createReview = async (req, res) => {
  try {
    const { bookingId, vehicleId, rating, comment } = req.body;
    const review = await reviewService.createReview(
      req.user.id,
      bookingId,
      vehicleId,
      rating,
      comment
    );
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update own review
exports.updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(
      req.user.id,
      req.params.reviewId,
      req.body
    );
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete own review
exports.deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.user.id, req.params.reviewId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Owner: get reviews for their vehicles
exports.getOwnerReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsForOwner(req.user.id);
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin delete any review
exports.adminDeleteReview = async (req, res) => {
  try {
    await reviewService.adminDeleteReview(req.params.reviewId);
    res.json({ message: "Review deleted by admin" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Customer: get own reviews
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByUser(req.user.id);
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Public: get reviews for a vehicle (anyone can view before booking)
exports.getReviewsForVehicle = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsForVehicle(req.params.vehicleId);
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Admin: get all reviews paginated
exports.getAllReviewsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await reviewService.getAllReviewsPaginated(parseInt(page), parseInt(limit));
    res.json({ success: true, message: "All reviews fetched (paginated)", ...reviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Owner: get reviews for their vehicles paginated
exports.getOwnerReviewsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await reviewService.getReviewsForOwnerPaginated(req.user.id, parseInt(page), parseInt(limit));
    res.json({ success: true, message: "Owner reviews fetched (paginated)", ...reviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Customer: get own reviews paginated
exports.getMyReviewsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await reviewService.getReviewsByUserPaginated(req.user.id, parseInt(page), parseInt(limit));
    res.json({ success: true, message: "Customer reviews fetched (paginated)", ...reviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Public: get reviews for a vehicle paginated
exports.getReviewsForVehiclePaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await reviewService.getReviewsForVehiclePaginated(req.params.vehicleId, parseInt(page), parseInt(limit));
    res.json({ success: true, message: "Vehicle reviews fetched (paginated)", ...reviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};