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
  getAllUnvarifiedVehicles,
  adminVerifyVehicle,
  updateVehicleStatus,
  adminUpdateVerificationStatus
} = require("../controllers/vehicle.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();


router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), adminVerifyVehicle);


// Customer: view only available vehicles
router.get("/available",authMiddleware,roleMiddleware("customer"),getAvailableVehicles);
// Admin: view ALL available vehicles
router.get("/admin/available",authMiddleware,roleMiddleware("admin"),getAllAvailableVehicles);

// Admin: view ALL unavailable vehicles
router.get("/admin/unavailable",authMiddleware,roleMiddleware("admin"),getAllUnavailableVehicles);
// Admin: view ALL unvarified vehicles

router.get("/admin/unvarified",authMiddleware,roleMiddleware("admin"),getAllUnvarifiedVehicles);
// Admin: update verification status true/false
router.put(
  "/:id/verification",
  authMiddleware,
  roleMiddleware("admin"),
  adminUpdateVerificationStatus
);

// Owner: update vehicle status (available/unavailable)




router.put("/:id/status", authMiddleware, roleMiddleware("owner"), updateVehicleStatus);


// Customer: view all available vehicles of the owner of a selected vehicle
router.get("/owner/:id/available",authMiddleware,roleMiddleware("customer"),getAvailableVehiclesByOwner);


// Customer can also POST ( change owner automatically)
router.post("/", authMiddleware, addVehicle);

// Owner-only routes(get,put,delete)
router.get("/", authMiddleware, roleMiddleware("owner"), getVehicles);
router.get("/:id", authMiddleware, roleMiddleware("owner"), getVehicleById);
router.put("/:id", authMiddleware, roleMiddleware("owner"), updateVehicle);
router.delete("/:id", authMiddleware, roleMiddleware("owner"), deleteVehicle);

module.exports = router;