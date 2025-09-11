const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["cash", "card", "online"], required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);