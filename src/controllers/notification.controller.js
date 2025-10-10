const notificationService = require("../services/notification.service");

class NotificationController {
    // ✅ Create Notification (Admin only)
    async createNotification(req, res) {
        try {
            if (req.user.role !== "admin") {
                return res.status(403).json({ message: "Only admins can create notifications" });
            }

            const notification = await notificationService.createNotification(req.body, req.user._id);
            res.status(201).json({ success: true, notification });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // ✅ Get notifications for logged-in user based on role
    async getNotifications(req, res) {
        try {
            // Ensure user data exists in request
            if (!req.user || !req.user.role) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access. Please log in again.",
                });
            }

            const userRole = req.user.role.toLowerCase(); // normalize role casing

            let notifications = [];

            // Admins → view all
            if (userRole === "admin") {
                notifications = await notificationService.getAllNotifications();
            } else {
                // Owners & Customers → only relevant ones
                notifications = await notificationService.getNotificationsForRole(userRole);
            }

            return res.status(200).json({
                success: true,
                count: notifications.length,
                data: notifications,
            });
        } catch (error) {
            console.error("❌ Error fetching notifications:", error.message);
            return res.status(500).json({
                success: false,
                message: error.message || "Server error while fetching notifications.",
            });
        }
    }



    // ✅ Mark notification as read
    /*async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const updatedNotification = await notificationService.markAsRead(id, req.user._id);
            res.status(200).json({ success: true, notification: updatedNotification });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // ✅ Deactivate notification (Admin only)
    async deactivate(req, res) {
        try {
            if (req.user.role !== "admin") {
                return res.status(403).json({ message: "Only admins can deactivate notifications" });
            }

            const { id } = req.params;
            const updatedNotification = await notificationService.deactivateNotification(id);
            res.status(200).json({ success: true, notification: updatedNotification });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }*/
}

module.exports = new NotificationController();
