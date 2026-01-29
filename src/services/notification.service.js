const Notification = require("../models/notification.model");

class NotificationService {
    // Create new notification
    async createNotification(data, adminId) {
        const { title, message, targetAudience, priority } = data;

        const notification = new Notification({
            title,
            message,
            targetAudience,
            priority,
            createdBy: adminId,

            // ✅ Auto-set date & time
            date: {
                type: String,
                default: () => new Date().toISOString().split("T")[0] // YYYY-MM-DD
            },
            time: {
                type: String,
                default: () => new Date().toTimeString().split(" ")[0] // HH:MM:SS
            },

            status: { type: String, default: "active" }
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

            return notifications.map((n) => ({
                ...n,
                date: new Date(n.createdAt).toLocaleDateString(),       // e.g. 10/10/2025
                time: new Date(n.createdAt).toLocaleTimeString(),       // e.g. 12:44 PM
            }));
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

    async getDeactivatedNotifications() {
        try {
            const notifications = await Notification.find({ isActive: false })
                .populate("createdBy", "firstName lastName role email")
                .sort({ createdAt: -1 })
                .lean();

            // Optional: format date and time
            return notifications.map(n => ({
                ...n,
                date: new Date(n.createdAt).toLocaleDateString(),
                time: new Date(n.createdAt).toLocaleTimeString()
            }));
        } catch (error) {
            console.error("Error in getDeactivatedNotifications:", error.message);
            throw new Error("Failed to fetch deactivated notifications.");
        }
    }


    async updateNotification(id, data) {
        return await Notification.findByIdAndUpdate(id, data, { new: true });
    }

    async activateNotification(id) {
        return await Notification.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );
    }

    async deactivateNotification(id) {
        return await Notification.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }

    // Mark a notification as read by a specific user
async markAsRead(notificationId, userId) {
    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { $addToSet: { readBy: userId } },
            { new: true, runValidators: true }
        );

        if (!notification) {
            throw new Error("Notification not found");
        }

        return notification;
    } catch (error) {
        console.error("Error in markAsRead:", error.message);
        throw new Error("Failed to mark notification as read.");
    }
    }

    // Mark a notification as read by a specific user
    /*async markAsRead(notificationId, userId) {
        return await Notification.findByIdAndUpdate(
            notificationId,
            { $addToSet: { readBy: userId } },
            { new: true }
        );
    }*/
}

module.exports = new NotificationService();
