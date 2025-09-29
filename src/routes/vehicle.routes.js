const express = require("express");
const {
  addVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleImagesOnly, // ✅ new function
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
const { upload, handleUploadErrors } = require("../middlewares/uploadMiddleware"); 

const router = express.Router();

// -------------------- Admin Routes --------------------

// Admin: verify a vehicle
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), adminVerifyVehicle);

// Admin: get all available vehicles
router.get("/admin/available", authMiddleware, roleMiddleware("admin"), getAllAvailableVehicles);

// Admin: get all unavailable vehicles
router.get("/admin/unavailable", authMiddleware, roleMiddleware("admin"), getAllUnavailableVehicles);

// Admin: get all unverified vehicles
router.get("/admin/unvarified", authMiddleware, roleMiddleware("admin"), getAllUnvarifiedVehicles);

// Admin: manually update verification status of a vehicle
router.put("/:id/verification", authMiddleware, roleMiddleware("admin"), adminUpdateVerificationStatus);

// -------------------- Owner Routes --------------------

// Owner: add a new vehicle with images (mandatory, up to 5)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("owner"),
  upload.array("images", 5),
  handleUploadErrors,
  addVehicle
);

// Owner: get all vehicles belonging to logged-in owner
router.get("/", authMiddleware, roleMiddleware("owner"), getVehicles);

// Owner: get a single vehicle by ID
router.get("/:id", authMiddleware, roleMiddleware("owner"), getVehicleById);

// Owner: update vehicle details (NO image handling)
router.put("/:id", authMiddleware, roleMiddleware("owner"), updateVehicle);

// Owner: update vehicle images only (optional, up to 5)
router.put(
  "/:id/images",
  authMiddleware,
  roleMiddleware("owner"),
  upload.array("images", 5),
  handleUploadErrors,
  updateVehicleImagesOnly
);

// Owner: update vehicle status (available/unavailable)
router.put("/:id/status", authMiddleware, roleMiddleware("owner"), updateVehicleStatus);

// Owner: delete a vehicle (deletes images too)
router.delete("/:id", authMiddleware, roleMiddleware("owner"), deleteVehicle);

// -------------------- Customer Routes --------------------

// Customer: view all available vehicles
router.get("/available", authMiddleware, roleMiddleware("customer"), getAvailableVehicles);

// Customer: view all available vehicles of a specific owner
router.get("/owner/:id/available", authMiddleware, roleMiddleware("customer"), getAvailableVehiclesByOwner);

module.exports = router;
