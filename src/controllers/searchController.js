const Vehicle = require("../models/vehicle.model");

// Search vehicles by location
exports.searchByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ message: "Location is required" });

    const vehicles = await Vehicle.find({
      status: "available",
      location: { $regex: location, $options: "i" } // case-insensitive search
    })
    .populate("vehicleTypeId", "name")
    .populate("fuelTypeId", "type")
    .populate("ownerId", "firstName lastName");

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search vehicles by price range
exports.searchByPrice = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;
    if (!minPrice && !maxPrice) return res.status(400).json({ message: "At least minPrice or maxPrice is required" });

    const filter = { status: "available" };
    if (minPrice || maxPrice) filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);

    const vehicles = await Vehicle.find(filter)
      .populate("vehicleTypeId", "name")
      .populate("fuelTypeId", "type")
      .populate("ownerId", "firstName lastName");

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search vehicles by vehicle type
exports.searchByVehicleType = async (req, res) => {
  try {
    const { typeId } = req.query;
    if (!typeId) return res.status(400).json({ message: "Vehicle type ID is required" });

    const vehicles = await Vehicle.find({
      status: "available",
      vehicleTypeId: typeId
    })
    .populate("vehicleTypeId", "name")
    .populate("fuelTypeId", "type")
    .populate("ownerId", "firstName lastName");

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};