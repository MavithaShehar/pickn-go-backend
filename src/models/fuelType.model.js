const mongoose = require("mongoose");

const fuelTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  fuelTypeID : { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model("FuelType", fuelTypeSchema);