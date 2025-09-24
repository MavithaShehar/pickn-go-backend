const reviewService = require("../services/review.service");

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

exports.deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.user.id, req.params.reviewId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    let reviews;
    if (req.user.role === "owner") {
      reviews = await reviewService.getReviewsForOwner(req.user.id);
    } else if (req.user.role === "admin") {
      reviews = await reviewService.getAllReviews();
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.adminDeleteReview = async (req, res) => {
  try {
    await reviewService.adminDeleteReview(req.params.reviewId);
    res.json({ message: "Review deleted by admin" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
