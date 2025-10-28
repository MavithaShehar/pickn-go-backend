const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alert.controller");
const authMiddleware = require("../middlewares/authMiddleware"); // your auth middleware

// Get all alerts for logged-in customer
router.get("/", authMiddleware, alertController.getCustomerAlerts);

// Mark a specific alert as read
router.patch("/:id/read", authMiddleware, alertController.markAlertAsRead);

module.exports = router;
