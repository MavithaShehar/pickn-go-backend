const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Admin creates a notification
router.post("/",authMiddleware, roleMiddleware("admin"), notificationController.createNotification);

// Get notifications (based on logged-in user’s role)
router.get("/",authMiddleware, notificationController.getNotifications);

// ✅ Edit notification (Admin only)
router.put("/:id", authMiddleware, roleMiddleware("admin"), notificationController.updateNotification);

// ✅ Deactivate notification
router.put("/deactivate/:id", authMiddleware, roleMiddleware("admin"), notificationController.deactivateNotification);

// ✅ Activate notification
router.put("/activate/:id", authMiddleware, roleMiddleware("admin"), notificationController.activateNotification);

// ✅ Get all deactivated notifications (admin only)
router.get("/deactivated", authMiddleware, roleMiddleware("admin"), notificationController.getDeactivatedNotifications);

//Mark as read
router.put("/:id/read",authMiddleware, roleMiddleware("admin","customer","owner"), notificationController.markAsRead);


module.exports = router;
