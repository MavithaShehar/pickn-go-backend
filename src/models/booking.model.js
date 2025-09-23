const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingStartDate: { type: Date, required: true },
  bookingEndDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  bookingStatus: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);