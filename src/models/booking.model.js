const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingStartDate: { type: Date, required: true },
  bookingEndDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  bookingStatus: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled", "ongoing", "completed"], 
    default: "pending" 
  },
   // New fields for start and end locations
  startLocation: { type: String, required: true }, 
  endLocation: { type: String, required: true },

  // New fields for mileage tracking
  agreedMileage: { type: Number }, // allowance
  startOdometer: { type: Number },
  endOdometer: { type: Number },
  totalMileageUsed: { type: Number },
  extraMileage: { type: Number },
  ratePerKm: { type: Number },
  extraCharge: { type: Number },

  // Handover request flag
  handoverRequest: { type: Boolean, default: false }

}, { timestamps: true });
  

module.exports = mongoose.model("Booking", bookingSchema);