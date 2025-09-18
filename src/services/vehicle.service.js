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

// Get all available vehicles (for customers)
async function getAvailableVehicles() {
  return await Vehicle.find({ status: "available" });
}

// Get all available vehicles (for owners )
async function getAllAvailableVehicles() {
  return await Vehicle.find({ status: "available" });
}

// Get all unavailable vehicles (for owners )
async function getAllUnavailableVehicles() {
  return await Vehicle.find({ status: "unavailable" });
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
// Get all available vehicles of a specific owner
async function getAvailableVehiclesByOwner(vehicleId) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return null;

  return await Vehicle.find({ ownerId: vehicle.ownerId, status: "available" });
}

module.exports = {
  createVehicle,
  getOwnerVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getAllAvailableVehicles,     
  getAllUnavailableVehicles,
  getAvailableVehiclesByOwner,
};