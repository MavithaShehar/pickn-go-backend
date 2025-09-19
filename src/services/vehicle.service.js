const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

// Create a new vehicle (only verified owners)
async function createVehicle(ownerId, vehicleData) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can add vehicles");
  }

  const vehicle = new Vehicle({ ...vehicleData, ownerId });
  return await vehicle.save();
}

// Get all vehicles by owner
async function getOwnerVehicles(ownerId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can view their vehicles");
  }

  return await Vehicle.find({ ownerId });
}

// Get single vehicle by ID
async function getVehicleById(ownerId, vehicleId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can view their vehicles");
  }

  return await Vehicle.findOne({ _id: vehicleId, ownerId });
}

// Update vehicle
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

// Delete vehicle
async function deleteVehicle(ownerId, vehicleId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can delete vehicles");
  }

  return await Vehicle.findOneAndDelete({ _id: vehicleId, ownerId });
}

// Get available vehicles (for customers)
async function getAvailableVehicles() {
  return await Vehicle.find({ status: "available", verificationStatus: true });
}

// Admin: get all available vehicles
async function getAllAvailableVehicles() {
  return await Vehicle.find({ status: "available" });
}

// Admin: get all unavailable vehicles
async function getAllUnavailableVehicles() {
  return await Vehicle.find({ status: "unavailable" });
}

// Admin: get all unverified vehicles
async function getAllUnvarifiedVehicles() {
  return await Vehicle.find({ verificationStatus: false });
}


// Admin: verify a vehicle
async function adminVerifyVehicle(vehicleId) {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId");
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  vehicle.verificationStatus = true;
  await vehicle.save();

  // Send email to owner
  if (vehicle.ownerId && vehicle.ownerId.email) {
    await sendEmail(
      vehicle.ownerId.email,
      "Vehicle Verified",
      `Your vehicle "${vehicle.title}" has been verified.`,
      `<p>Hello ${vehicle.ownerId.firstName},</p>
       <p>Your vehicle <b>${vehicle.title}</b> has been <b>verified</b> by admin and is now available for customers.</p>
       <p>Thank you,<br/>PicknGo Team</p>`
    );
  }

  return vehicle;
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
  getAllUnvarifiedVehicles,
  adminVerifyVehicle, 
};
