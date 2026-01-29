const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        // Optional reference fields — depending on alert source
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
        vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleType" },
            complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
            reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
            damageId: { type: mongoose.Schema.Types.ObjectId, ref: "DamageReport" },

        // Alert message content
        message: { type: String, required: true },

        // Status tracking
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
