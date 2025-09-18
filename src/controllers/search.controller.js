const Vehicle = require("../models/search.model");

const createVehicle = async (req, res) => {
  try {
    const { name, type, price, location, description } = req.body;

    // Validation
    if (!name || !type || !price || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, type, price, and location are required",
      });
    }

    // Create new vehicle
    const vehicle = await Vehicle.create({
      name,
      type,
      price,
      location,
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during vehicle creation",
      error: error.message,
    });
  }
};

const getFilteredVehicles = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, location } = req.body;

    // Build dynamic query
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (location) {
      query.location = location;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.price.$lte = maxPrice;
      }
    }

    // Fetch matching vehicles
    const vehicles = await Vehicle.find(query).select("-__v");

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during search",
      error: error.message,
    });
  }
};

module.exports = { createVehicle, getFilteredVehicles };