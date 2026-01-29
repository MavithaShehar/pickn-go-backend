const mongoose = require("mongoose");
const { createAlert } = require("../services/alert.service");

const vehicleTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  vehicleTypeID: { type: String, required: true, unique: true },
}, { timestamps: true });

vehicleTypeSchema.post("save", async function (doc) {
      await createAlert({
        vehicleTypeId: doc._id,
        message: `New vehicle type "${doc.name}" (ID: ${doc.vehicleTypeID}) has been added successfully.`,
      });
});

module.exports = mongoose.model("VehicleType", vehicleTypeSchema);