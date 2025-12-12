const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const sendEmail = require("../utils/sendEmail");
const generateVehicleCode = require("../utils/generateVehicleCode");



// Ensures that only verified owners can perform restricted actions
async function ensureVerifiedOwner(ownerId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner" || !owner.verificationStatus) {
    throw new Error("Only verified owners can perform this action");
  }
  return owner;
}
//create vehicle
async function createVehicle(ownerId, vehicleData) {
  try {
    await ensureVerifiedOwner(ownerId);

    // ✅ Generate unique vehicle code
    const vehicleCode = await generateVehicleCode();

    const vehicle = new Vehicle({
      ...vehicleData,
      ownerId,
      vehicleCode, // ✅ add code
    });

    await vehicle.save();
    return { success: true, message: "Vehicle created successfully", data: vehicle };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Get all vehicles of an owner
async function getOwnerVehicles(ownerId) {
  try {
    await ensureVerifiedOwner(ownerId);
    const vehicles = await Vehicle.find({ ownerId });
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Get single vehicle by ID
async function getVehicleById(ownerId, vehicleId) {
  try {
    await ensureVerifiedOwner(ownerId);
    const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId });
    if (!vehicle) return { success: false, message: "Vehicle not found" };
    return { success: true, data: vehicle };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Update full vehicle details
async function updateVehicle(ownerId, vehicleId, updateData) {
  try {
    await ensureVerifiedOwner(ownerId);
    const updated = await Vehicle.findOneAndUpdate({ _id: vehicleId, ownerId }, updateData, { new: true });
    if (!updated) return { success: false, message: "Vehicle not found" };
    return { success: true, message: "Vehicle updated successfully", data: updated };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Update vehicle images only (Base64)
async function updateVehicleImagesOnly(ownerId, vehicleId, imagesBase64) {
  try {
    await ensureVerifiedOwner(ownerId);

    const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId });
    if (!vehicle) return { success: false, message: "Vehicle not found" };

    vehicle.images = imagesBase64; // overwrite with Base64 images
    await vehicle.save();

    return { success: true, message: "Vehicle images updated successfully", data: vehicle };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Delete vehicle
async function deleteVehicle(ownerId, vehicleId) {
  try {
    await ensureVerifiedOwner(ownerId);

    // Check if vehicle exists
    const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId });
    if (!vehicle) return { success: false, message: "Vehicle not found" };

    // Check for active bookings (pending, confirmed, ongoing)
    const activeBookings = await Booking.find({
      vehicleId: vehicleId,
      bookingStatus: { $in: ["pending", "confirmed", "ongoing"] }
    });

    if (activeBookings.length > 0) {
      const bookingCodes = activeBookings.map(b => b.bookingCode).join(", ");
      return { 
        success: false, 
        message: `Cannot delete vehicle. It has ${activeBookings.length} active booking(s) with status: pending, confirmed, or ongoing. Booking Code(s): ${bookingCodes}` 
      };
    }

    // Delete the vehicle if no active bookings
    const deletedVehicle = await Vehicle.findOneAndDelete({ _id: vehicleId, ownerId });
    
    return { 
      success: true, 
      message: "Vehicle deleted successfully", 
      data: deletedVehicle 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getAvailableVehicles() {
  // Only verified and available vehicles
  const vehicles = await Vehicle.find({ status: "available", verificationStatus: true });
  return vehicles;
}

// Admin: get all available vehicles
async function getAllAvailableVehicles() {
  try {
    const vehicles = await Vehicle.find({ status: "available" });
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Admin: get all unavailable vehicles
async function getAllUnavailableVehicles() {
  try {
    const vehicles = await Vehicle.find({ status: "unavailable" });
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Admin: get all unverified vehicles
async function getAllUnvarifiedVehicles() {
  try {
    const vehicles = await Vehicle.find({ verificationStatus: false });
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Admin: get all verified vehicles
async function getAllVerifiedVehicles() {
  try {
    const vehicles = await Vehicle.find({ verificationStatus: true });
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, message: error.message };
  }
}


// Admin verifies a vehicle and notifies owner by email
async function adminVerifyVehicle(vehicleId) {
  try {
    const vehicle = await Vehicle.findById(vehicleId).populate("ownerId");
    if (!vehicle) return { success: false, message: "Vehicle not found" };

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

    return { success: true, message: "Vehicle verified successfully", data: vehicle };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Update vehicle status (available/unavailable)
async function updateVehicleStatus(ownerId, vehicleId, status) {
  try {
    await ensureVerifiedOwner(ownerId);

    if (!["available", "unavailable"].includes(status)) {
      return { success: false, message: "Invalid status value. Must be 'available' or 'unavailable'" };
    }

    const vehicle = await Vehicle.findOneAndUpdate({ _id: vehicleId, ownerId }, { status }, { new: true });
    if (!vehicle) return { success: false, message: "Vehicle not found" };

    return { success: true, message: "Vehicle status updated successfully", data: vehicle };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Get all available vehicles of the same owner as a given vehicle
async function getAvailableVehiclesByOwner(vehicleId) {
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return { success: false, message: "Vehicle not found" };

    const vehicles = await Vehicle.find({ ownerId: vehicle.ownerId, status: "available" });
    return { success: true, data: vehicles };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Admin updates verification status (true/false)
async function adminUpdateVerificationStatus(vehicleId, status) {
  try {
    const vehicle = await Vehicle.findById(vehicleId).populate("ownerId");
    if (!vehicle) return { success: false, message: "Vehicle not found" };

    vehicle.verificationStatus = status;
    await vehicle.save();

    return { success: true, message: `Vehicle verification status updated to ${status}`, data: vehicle };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  createVehicle,
  getOwnerVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleImagesOnly,
  deleteVehicle,
  getAvailableVehicles,
  getAllAvailableVehicles,
  getAllUnavailableVehicles,
  getAvailableVehiclesByOwner,
  getAllUnvarifiedVehicles,
  updateVehicleStatus,
  adminUpdateVerificationStatus,
  adminVerifyVehicle,
   getAllVerifiedVehicles, // ✅ new export
};
