const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { getVehicleBookingCounts } = require("../controllers/vehicleBookingCount.controller");

const router = express.Router();

// Get booking count for all vehicles (accessible by owner, customer, or admin)
router.get("/booking-count", authMiddleware, getVehicleBookingCounts);

module.exports = router;
