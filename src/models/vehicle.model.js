const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  pricePerKm: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  year: { type: Number },
  seats: { type: Number },
  status: { type: String, enum: ["available", "unavailable"], default: "available" },
  vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleType" },
  fuelTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "FuelType" },
  location: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }]
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);