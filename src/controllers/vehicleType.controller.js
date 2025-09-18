const VehicleType = require("../models/vehicleType.model");

// Create new Vehicle Type (Admin only)
exports.createVehicleType = async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await VehicleType.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Vehicle Type already exists" });

    const vehicleType = await VehicleType.create({ name });
    res.status(201).json(vehicleType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Vehicle Types (All roles)
exports.getVehicleTypes = async (req, res) => {
  try {
    const types = await VehicleType.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Vehicle Type (Admin only)
exports.updateVehicleType = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await VehicleType.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Vehicle Type not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Vehicle Type (Admin only)
exports.deleteVehicleType = async (req, res) => {
  try {
    const deleted = await VehicleType.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Vehicle Type not found" });

    res.json({ message: "Vehicle Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
