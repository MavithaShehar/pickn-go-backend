const Vehicle = require("../models/vehicle.model");

// Create a new vehicle
async function createVehicle(ownerId, vehicleData) {
  const vehicle = new Vehicle({ ...vehicleData, ownerId });
  return await vehicle.save();
}

// Get all vehicles by owner
async function getOwnerVehicles(ownerId) {
  return await Vehicle.find({ ownerId });
}

// Get single vehicle by ID (only if belongs to owner)
async function getVehicleById(ownerId, vehicleId) {
  return await Vehicle.findOne({ _id: vehicleId, ownerId });
}

//update
async function updateVehicle(ownerId, vehicleId, updateData) {
  return await Vehicle.findOneAndUpdate(
    { _id: vehicleId, ownerId },
    updateData,
    { new: true }
  );
}

//delete
async function deleteVehicle(ownerId, vehicleId) {
  return await Vehicle.findOneAndDelete({ _id: vehicleId, ownerId });
}

module.exports = {
  createVehicle,
  getOwnerVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
