const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  vehicleTypeID: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model("VehicleType", vehicleTypeSchema);