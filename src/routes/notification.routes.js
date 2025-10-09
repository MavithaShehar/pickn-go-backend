const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Admin creates a notification
router.post("/",authMiddleware, roleMiddleware("admin"), notificationController.createNotification);

// Get notifications (based on logged-in user’s role)
router.get("/",authMiddleware, notificationController.getNotifications);

// Mark as read
router.put("/:id/read",authMiddleware, roleMiddleware("admin"), notificationController.markAsRead);

// Deactivate a notification (Admin only)
router.put("/:id/deactivate",authMiddleware, roleMiddleware("admin"), notificationController.deactivate);

module.exports = router;
