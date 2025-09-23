const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authReview, isOwnerOrAdmin } = require("../middlewares/reviewAuth");

// Routes only map endpoints → controller
router.post("/", authReview, reviewController.createReview);
router.put("/:reviewId", authReview, reviewController.updateReview);
router.delete("/:reviewId", authReview, reviewController.deleteReview);
router.get("/", authReview, reviewController.getReviews);
router.delete("/:reviewId/admin", authReview, isOwnerOrAdmin, reviewController.adminDeleteReview);

module.exports = router;
