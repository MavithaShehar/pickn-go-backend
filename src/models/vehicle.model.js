const mongoose = require("mongoose");
const { createAlert } = require("../services/alert.service");

const vehicleSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  pricePerKm: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  year: { type: Number },
  seats: { type: Number },
  status: { type: String, enum: ["available", "unavailable"], default: "available" },
   verificationStatus: { type: Boolean, default: false },
  vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleType" },
  vehicleCode: { type: String, unique: true },
  fuelTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "FuelType" },
  city: { type: String, required: true },
  district: { type: String, required: true },
  images: { type: [String], },
}, { timestamps: true });

vehicleSchema.post("save", async function (doc) {
      await createAlert({
        vehicleId: doc._id,
        customerId: doc.ownerId,
        message: `Vehicle "${doc.title}" (Code: ${doc.vehicleCode}) has been added successfully.`,
      });
});

module.exports = mongoose.model("Vehicle", vehicleSchema);