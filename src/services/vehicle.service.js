const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");

// Create a new vehicle
async function createVehicle(ownerId, vehicleData) {
  const vehicle = new Vehicle({ ...vehicleData, ownerId });
  return await vehicle.save();
}

// Get all vehicles by owner (for logged-in owner)
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

// Get all available vehicles (for admins)
async function getAllAvailableVehicles() {
  return await Vehicle.find({ status: "available" });
}

// Get all unavailable vehicles (for admins)
async function getAllUnavailableVehicles() {
  return await Vehicle.find({ status: "unavailable" });
}

// Update vehicle (only by owner)
async function updateVehicle(ownerId, vehicleId, updateData) {
  return await Vehicle.findOneAndUpdate(
    { _id: vehicleId, ownerId },
    updateData,
    { new: true }
  );
}

// Delete vehicle (only by owner)
async function deleteVehicle(ownerId, vehicleId) {
  return await Vehicle.findOneAndDelete({ _id: vehicleId, ownerId });
}

// Get all available vehicles of a specific owner by vehicleId
async function getAvailableVehiclesByOwner(vehicleId) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return null;

  return await Vehicle.find({ ownerId: vehicle.ownerId, status: "available" });
}

// ✅ NEW FUNCTION: Get vehicles by owner name (for customers)
async function getVehiclesByOwnerName(ownerName) {
  // Find the owner by name (case-insensitive)
  const owner = await User.findOne({ name: { $regex: ownerName, $options: "i" } });
  if (!owner) return [];

  // Find all vehicles of that owner + populate owner info + reviews
  return await Vehicle.find({ ownerId: owner._id })
    .populate("ownerId", "name email phone")
    .populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "name",
      },
    });
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
  getVehiclesByOwnerName, 
};
