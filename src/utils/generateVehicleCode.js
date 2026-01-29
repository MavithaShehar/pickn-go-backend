// utils/generateVehicleCode.js
const Vehicle = require("../models/vehicle.model");

async function generateVehicleCode() {
  // Step 1: Get today’s date in YYYYMMDD format
  const today = new Date();
  const datePart = today
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ""); // e.g., 20251010

  // Step 2: Count how many vehicles are already created today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const countToday = await Vehicle.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // Step 3: Generate a new sequence number (pad with leading zeros)
  const seq = String(countToday + 1).padStart(5, "0");

  // Step 4: Combine parts to make the code
  const vehicleCode = `VHR-${datePart}-${seq}`;

  return vehicleCode;
}

module.exports = generateVehicleCode;
