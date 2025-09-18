const express = require("express");
const router = express.Router();

const {
  createVehicleType,
  getVehicleTypes,
  updateVehicleType,
  deleteVehicleType,
} = require("../controllers/vehicleType.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Public view for all roles
router.get("/", authMiddleware, getVehicleTypes);

// Admin routes
router.post("/", authMiddleware, roleMiddleware("admin"), createVehicleType);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateVehicleType);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteVehicleType);

module.exports = router;
