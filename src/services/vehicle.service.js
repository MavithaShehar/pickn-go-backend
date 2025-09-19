const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");
const VehicleType = require("../models/vehicleType.model");
const FuelType = require("../models/fuelType.model");

// Create a new vehicle
async function createVehicle(ownerId, vehicleData) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can add vehicles");
  }

  const vehicle = new Vehicle({ ...vehicleData, ownerId });
  return await vehicle.save();
}


// Get all vehicles by owner (only verified owners can fetch their own vehicles)
async function getOwnerVehicles(ownerId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can view their vehicles");
  }

  return await Vehicle.find({ ownerId });
}

// Get single vehicle by ID (only if belongs to verified owner)
async function getVehicleById(ownerId, vehicleId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can view their vehicles");
  }

  return await Vehicle.findOne({ _id: vehicleId, ownerId });
}

// Update vehicle (only verified owners)
async function updateVehicle(ownerId, vehicleId, updateData) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can update vehicles");
  }

  return await Vehicle.findOneAndUpdate(
    { _id: vehicleId, ownerId },
    updateData,
    { new: true }
  );
}

// Delete vehicle (only verified owners)
async function deleteVehicle(ownerId, vehicleId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can delete vehicles");
  }

  return await Vehicle.findOneAndDelete({ _id: vehicleId, ownerId });
}

// Get all available vehicles (for customers)
async function getAvailableVehicles() {
  return await Vehicle.find({ status: "available" });
}

// Admin: get all available vehicles
async function getAllAvailableVehicles() {
  return await Vehicle.find({ status: "available" });
}

// Admin: get all unavailable vehicles
async function getAllUnavailableVehicles() {
  return await Vehicle.find({ status: "unavailable" });
}

// Get all available vehicles of a specific owner (for customers)
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
