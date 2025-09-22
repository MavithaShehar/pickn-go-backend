const express = require("express");
const router = express.Router();
const reviewService = require("../services/rate.and.review.service");
const { authReview, isOwnerOrAdmin } = require("../middlewares/reviewAuth");


// Create review
router.post("/", authReview, async (req, res) => {
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
});

// Update review 
router.put("/:reviewId", authReview, async (req, res) => {
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
});

// Delete own review
router.delete("/:reviewId", authReview, async (req, res) => {
  try {
    await reviewService.deleteReview(req.user.id, req.params.reviewId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// Get reviews for a vehicle 
router.get("/vehicle/:vehicleId", authReview, async (req, res) => {
  try {
    let reviews;
    if (req.user.role === "owner") {
      reviews = await reviewService.getReviewsForOwner(
        req.user.id,
        req.params.vehicleId
      );
    } else if (req.user.role === "admin") {
      reviews = await reviewService.getReviewsForAdmin(req.params.vehicleId);
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// Admin delete any review
router.delete("/:reviewId/admin", authReview, isOwnerOrAdmin, async (req, res) => {
  try {
    await reviewService.adminDeleteReview(req.params.reviewId);
    res.json({ message: "Review deleted by admin" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
