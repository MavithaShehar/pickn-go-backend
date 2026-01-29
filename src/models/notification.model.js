const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        // Who created it (only admins)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Who should receive it
        targetAudience: {
            type: String,
            enum: ["all", "admin", "owner", "customer"],
            default: "all",
        },
        // Optional: track which users have seen the notification
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        // Optional: expiration date (if notifications are temporary)
        expiresAt: {
            type: Date,
        },
        // Optional: priority
        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal",
        },
        // Whether it's still active (admin can deactivate)
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
