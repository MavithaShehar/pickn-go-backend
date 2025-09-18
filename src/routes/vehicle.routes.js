const express = require("express");
const {
  addVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getAllAvailableVehicles,
  getAllUnavailableVehicles,
  getAvailableVehiclesByOwner,
  getVehiclesByOwnerName,   
} = require("../controllers/vehicle.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();



// Customer: view only available vehicles
router.get(
  "/available",
  authMiddleware,
  roleMiddleware("customer"),
  getAvailableVehicles
);

// Customer: view all available vehicles of the owner of a selected vehicle
router.get(
  "/owner/:id/available",
  authMiddleware,
  roleMiddleware("customer"),
  getAvailableVehiclesByOwner
);

// Customer: search vehicles by owner name
// To test without auth, comment out the authMiddleware and roleMiddleware lines
router.get(
  "/search/owner",
  authMiddleware,
  roleMiddleware("customer"),
  getVehiclesByOwnerName
);



// Admin: view ALL available vehicles
router.get(
  "/admin/available",
  authMiddleware,
  roleMiddleware("admin"),
  getAllAvailableVehicles
);

// Admin: view ALL unavailable vehicles
router.get(
  "/admin/unavailable",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUnavailableVehicles
);



// Owner: add new vehicle (POST)
router.post("/", authMiddleware, addVehicle);

// Owner-only routes (get, put, delete)
router.get("/", authMiddleware, roleMiddleware("owner"), getVehicles);
router.get("/:id", authMiddleware, roleMiddleware("owner"), getVehicleById);
router.put("/:id", authMiddleware, roleMiddleware("owner"), updateVehicle);
router.delete("/:id", authMiddleware, roleMiddleware("owner"), deleteVehicle);

module.exports = router;
