const express = require("express");
const {
  addVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicle.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Customer can also POST ( get upgraded to owner automatically)
router.post("/", authMiddleware, addVehicle);

// Owner-only routes(get,put,delete)
router.get("/", authMiddleware, roleMiddleware("owner"), getVehicles);
router.get("/:id", authMiddleware, roleMiddleware("owner"), getVehicleById);
router.put("/:id", authMiddleware, roleMiddleware("owner"), updateVehicle);
router.delete("/:id", authMiddleware, roleMiddleware("owner"), deleteVehicle);

module.exports = router;
