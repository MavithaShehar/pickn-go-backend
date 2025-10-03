const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create a review (only authenticated customers can review their booking)
router.post("/", authMiddleware, roleMiddleware("customer", "owner"), reviewController.createReview);

// Update review (only the same user can update)
router.put("/:reviewId", authMiddleware, roleMiddleware("customer", "owner"), reviewController.updateReview);

// Delete own review
router.delete("/:reviewId", authMiddleware, roleMiddleware("customer", "owner"), reviewController.deleteReview);

// Owner: get reviews for their vehicles
router.get("/owner", authMiddleware, roleMiddleware("owner"), reviewController.getOwnerReviews);

// Admin: get all reviews
router.get("/admin", authMiddleware, roleMiddleware("admin"), reviewController.getAllReviews);

// Admin delete any review
router.delete("/:reviewId/admin", authMiddleware, roleMiddleware("admin"), reviewController.adminDeleteReview);

// Customer: get all reviews for a vehicle (before booking, no need to login)
router.get("/vehicle/:vehicleId", reviewController.getReviewsForVehicle);

// Customer: get own reviews (requires login)
router.get("/my", authMiddleware, roleMiddleware("customer", "owner"), reviewController.getMyReviews);

module.exports = router;
