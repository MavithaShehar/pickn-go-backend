const vehicleService = require("../services/vehicle.service");
const User = require("../models/user.model");

// Helper: ensure user is a verified owner
const ensureVerifiedOwner = (req, res) => {
  if (req.user.role !== "owner" || !req.user.verificationStatus) {
    return res
      .status(403)
      .json({ message: "Only verified owners can perform this action" });
  }
  return true;
};

// Add new vehicle (Supports both Base64 and file upload)
exports.addVehicle = async (req, res) => {
  try {
    if (req.user.role === "customer") {
      await User.findByIdAndUpdate(req.user.id, { role: "owner" });
      req.user.role = "owner";
    }

    if (!ensureVerifiedOwner(req, res)) return;

    // ✅ Check for both Base64 and file upload
    if ((!req.body.images || req.body.images.length === 0) && (!req.files || req.files.length === 0)) {
      return res
        .status(400)
        .json({ message: "At least one vehicle image is required" });
    }

    let images = [];

    // ✅ If files are uploaded (form-data), use Base64 from middleware
    if (req.files && req.files.length > 0) {
      images = req.body.images; // ✅ Base64 already in req.body.images
    } 
    // ✅ If Base64 images are sent in body
    else if (req.body.images && req.body.images.length > 0) {
      images = req.body.images;
    }

    const vehicleData = { ...req.body, images };

    const vehicle = await vehicleService.createVehicle(req.user.id, vehicleData);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all vehicles of logged-in owner
exports.getVehicles = async (req, res) => {
  try {
    if (!ensureVerifiedOwner(req, res)) return;
    const vehicles = await vehicleService.getOwnerVehicles(req.user.id);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single vehicle by ID (owner only)
exports.getVehicleById = async (req, res) => {
  try {
    if (!ensureVerifiedOwner(req, res)) return;

    const vehicle = await vehicleService.getVehicleById(
      req.user.id,
      req.params.id
    );
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vehicle info (no image update here)
exports.updateVehicle = async (req, res) => {
  try {
    if (!ensureVerifiedOwner(req, res)) return;

    const updateData = { ...req.body }; // fields like title, description, etc.

    const result = await vehicleService.updateVehicle(
      req.user.id,
      req.params.id,
      updateData
    );

    if (!result.success)
      return res.status(404).json({ message: result.message });

    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update only vehicle images (Base64 version)
exports.updateVehicleImagesOnly = async (req, res) => {
  try {
    if (!ensureVerifiedOwner(req, res)) return;

    if (!req.body.images || req.body.images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one Base64 image is required" });
    }

    const newImages = req.body.images; // overwrite old images

    const result = await vehicleService.updateVehicle(
      req.user.id,
      req.params.id,
      { images: newImages }
    );

    if (!result.success)
      return res.status(404).json({ message: result.message });

    res.json({
      success: true,
      message: "Vehicle images updated successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    if (!ensureVerifiedOwner(req, res)) return;

    const vehicle = await vehicleService.getVehicleById(
      req.user.id,
      req.params.id
    );
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const deleted = await vehicleService.deleteVehicle(
      req.user.id,
      req.params.id
    );
    if (!deleted) return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAvailableVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllAvailableVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminVerifyVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.adminVerifyVehicle(req.params.id);
    res.status(200).json({ message: "Vehicle verified successfully", vehicle });
  } catch (error) {
    if (error.message === "Vehicle not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUnvarifiedVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllUnvarifiedVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllVerifiedVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVerifiedVehicles();
    if (!vehicles.success) {
      return res.status(400).json({ message: vehicles.message });
    }
    res.json(vehicles.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUnavailableVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllUnavailableVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableVehiclesByOwner = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAvailableVehiclesByOwner(
      req.params.id
    );
    if (!vehicles) return res.status(404).json({ message: "Vehicle not found" });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVehicleStatus = async (req, res) => {
  try {
    if (!ensureVerifiedOwner(req, res)) return;

    const { status } = req.body;
    const updated = await vehicleService.updateVehicleStatus(
      req.user.id,
      req.params.id,
      status
    );

    res.json({
      message: "Vehicle status updated successfully",
      vehicle: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.adminUpdateVerificationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (typeof status !== "boolean") {
      return res.status(400).json({ message: "Status must be true or false" });
    }

    const vehicle = await vehicleService.adminUpdateVerificationStatus(
      req.params.id,
      status
    );

    res.status(200).json({
      message: `Vehicle verification status updated to ${status}`,
      vehicle,
    });
  } catch (error) {
    if (error.message === "Vehicle not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
