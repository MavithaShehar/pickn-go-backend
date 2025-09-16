const express = require("express");
const router = express.Router();

const {
  createFuelType,
  getFuelTypes,
  updateFuelType,
  deleteFuelType,
} = require("../controllers/fuelType.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Public view for all roles
router.get("/", authMiddleware, getFuelTypes);

// Admin routes
router.post("/", authMiddleware, roleMiddleware("admin"), createFuelType);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateFuelType);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteFuelType);

module.exports = router;
