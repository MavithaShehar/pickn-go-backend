const FuelType = require("../models/fuelType.model");

// Create Fuel Type (Admin only)
exports.createFuelType = async (req, res) => {
  try {
    const { type } = req.body;
    const exists = await FuelType.findOne({ type });
    if (exists)
      return res.status(400).json({ message: "Fuel Type already exists" });

    // Generate unique fuel type ID
    const lastFuelType = await FuelType.findOne({}, {}, { sort: { 'fuelTypeID': -1 } });
    
    let nextNumber = 1;
    if (lastFuelType && lastFuelType.fuelTypeID) {
      // Extract the number from the last ID (e.g., "FT-0001" -> 1)
      const lastNumber = parseInt(lastFuelType.fuelTypeID.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    
    // Format the ID as "FT-XXXX" with leading zeros
    const fuelTypeID = `FT-${nextNumber.toString().padStart(4, '0')}`;

    const fuelType = await FuelType.create({ type, fuelTypeID });
    res.status(201).json(fuelType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Fuel Types (All roles)
exports.getFuelTypes = async (req, res) => {
  try {
    const types = await FuelType.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Fuel Type (Admin only)
exports.updateFuelType = async (req, res) => {
  try {
    const { type } = req.body;
    const updated = await FuelType.findByIdAndUpdate(
      req.params.id,
      { type },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Fuel Type not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Fuel Type (Admin only)
exports.deleteFuelType = async (req, res) => {
  try {
    const deleted = await FuelType.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Fuel Type not found" });

    res.json({ message: "Fuel Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
