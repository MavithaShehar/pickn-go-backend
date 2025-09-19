const Vehicle = require("../models/vehicle.model");

// Create a new vehicle
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

// Get single vehicle by ID (only if belongs to verified owner)
async function getVehicleById(ownerId, vehicleId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can view their vehicles");
  }

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

//delete
async function deleteVehicle(ownerId, vehicleId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can delete vehicles");
  }

  return await Vehicle.findOneAndDelete({ _id: vehicleId, ownerId });
}
// Get all available vehicles of a specific owner
async function getAvailableVehiclesByOwner(vehicleId) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return null;

  return await Vehicle.find({ ownerId: vehicle.ownerId, status: "available" });
}

//  NEW FUNCTION: Get vehicles by owner name (for customers)
async function getVehiclesByOwnerName(ownerName) {
  // Search for owner by firstName OR lastName (case-insensitive)
  const owner = await User.findOne({ 
    role: "owner",
    $or: [
      { firstName: { $regex: ownerName, $options: "i" } },
      { lastName: { $regex: ownerName, $options: "i" } }
    ]
  });

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
};
