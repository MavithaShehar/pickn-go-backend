const Notification = require("../models/notification.model");

class NotificationService {
    // Create new notification
    async createNotification(data, adminId) {
        const { title, message, targetAudience, expiresAt, priority } = data;

        const notification = new Notification({
            title,
            message,
            targetAudience,
            expiresAt,
            priority,
            createdBy: adminId,
        });

        return await notification.save();
    }

    // ✅ Get ALL notifications (admins only)
    async getAllNotifications() {
        try {
            const notifications = await Notification.find({ isActive: true })
                .populate("createdBy", "firstName lastName role email")
                .sort({ createdAt: -1 })
                .lean();
            return notifications;
        } catch (error) {
            console.error("Error in getAllNotifications:", error.message);
            throw new Error("Failed to fetch all notifications.");
        }
    }

    // ✅ Get notifications for specific role (non-admins)
    async getNotificationsForRole(role) {
        try {
            if (!role) throw new Error("User role is required to fetch notifications.");

            const query = {
                isActive: true,
                $or: [
                    { targetAudience: "all" },
                    { targetAudience: role.toLowerCase() },
                ],
            };

            const notifications = await Notification.find(query)
                .populate("createdBy", "firstName lastName role email")
                .sort({ createdAt: -1 })
                .lean();

            return notifications;
        } catch (error) {
            console.error("Error in getNotificationsForRole:", error.message);
            throw new Error("Failed to fetch notifications for user role.");
        }
    }



    // Mark a notification as read by a specific user
    async markAsRead(notificationId, userId) {
        return await Notification.findByIdAndUpdate(
            notificationId,
            { $addToSet: { readBy: userId } },
            { new: true }
        );
    }

    // Deactivate a notification
    async deactivateNotification(notificationId) {
        return await Notification.findByIdAndUpdate(
            notificationId,
            { isActive: false },
            { new: true }
        );
    }
}

module.exports = new NotificationService();
