const Alert = require("../models/alert.model");

async function createAlert({ bookingId, customerId, vehicleId, vehicleTypeId, complaintId, reviewId,damageId, message }) {
    if (!message) throw new Error("Alert message is required");

    const alert = new Alert({
        bookingId,
        customerId,
        vehicleId,
        vehicleTypeId,
        complaintId,
        reviewId,
        damageId,
        message,
    });

    await alert.save();
    return alert;
}

module.exports = { createAlert };
