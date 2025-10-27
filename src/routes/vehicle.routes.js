const express = require("express");
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const vehicleBookingCountRoutes = require("./vehicleBookingCount.routes");
const uploadMiddleware = require("../middlewares/uploadMiddleware"); // ✅ multer diskStorage

const router = express.Router();

// ---------------- Public Routes ----------------

// Get all available vehicles (no auth required)
router.get("/available", vehicleController.getAvailableVehicles);

// ---------------- Booking Count Routes ----------------
router.use("/", vehicleBookingCountRoutes);

// ---------------- Owner Routes ----------------

// Add Vehicle (no images required initially)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.addVehicle
);

// Upload/Update Vehicle Images
router.put(
  "/:id/images",
  authMiddleware,
  roleMiddleware("owner"),
  (req, res, next) => {
    req.uploadType = "vehicle"; // used in multer middleware
    next();
  },
  uploadMiddleware.array("images", 5), // multiple images
  vehicleController.updateVehicleImagesOnly
);

// Get Owner Vehicles
router.get(
  "/owner/vehicle",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.getVehicles
);

// Get Vehicle by ID (Owner)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.getVehicleById
);

// Update Vehicle (Owner)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.updateVehicle
);

// Delete Vehicle
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.deleteVehicle
);

// ---------------- Customer Routes ----------------

// Get available vehicles by owner
router.get(
  "/owner/:id/available",
  authMiddleware,
  roleMiddleware("customer"),
  vehicleController.getAvailableVehiclesByOwner
);

// ---------------- Admin Routes ----------------

// Get all available vehicles
router.get(
  "/admin/available",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllAvailableVehicles
);

// Get all unavailable vehicles
router.get(
  "/admin/unavailable",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllUnavailableVehicles
);

// Get all unverified vehicles
router.get(
  "/admin/unverified",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllUnvarifiedVehicles
);

// Get all verified vehicles
router.get(
  "/admin/verified",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllVerifiedVehicles
);

// Admin verify vehicle
router.patch(
  "/:id/verify",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.adminVerifyVehicle
);

// Admin update verification status
router.put(
  "/:id/verification",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.adminUpdateVerificationStatus
);

module.exports = router;
