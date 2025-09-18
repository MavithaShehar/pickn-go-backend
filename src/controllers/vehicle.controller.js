const vehicleService = require("../services/vehicle.service");
const User = require("../models/user.model"); 

// Add new vehicle
exports.addVehicle = async (req, res) => {
  try {
    // If the user is a customer  change to owner
    if (req.user.role === "customer") {
      await User.findByIdAndUpdate(req.user.id, { role: "owner" });
      req.user.role = "owner"; // update role in current request
    }

    const vehicle = await vehicleService.createVehicle(req.user.id, req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all vehicles of login owner
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getOwnerVehicles(req.user.id);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
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

// Get available vehicles for customers
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAvailableVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Admin: get all available vehicles
exports.getAllAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllAvailableVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all unavailable vehicles
exports.getAllUnavailableVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllUnavailableVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const updated = await vehicleService.updateVehicle(
      req.user.id,
      req.params.id,
      req.body
    );
    if (!updated) return res.status(404).json({ message: "Vehicle not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
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

// Customer: get all available vehicles from the same owner of a selected vehicle
exports.getAvailableVehiclesByOwner = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAvailableVehiclesByOwner(req.params.id);
    if (!vehicles) return res.status(404).json({ message: "Vehicle not found" });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
