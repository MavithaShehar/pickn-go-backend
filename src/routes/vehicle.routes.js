const express = require("express");
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const vehicleBookingCountRoutes = require("./vehicleBookingCount.routes");
const uploadMiddleware = require("../middlewares/uploadMiddleware"); // ✅ add this

const router = express.Router();

// This MUST come first and NOT have authMiddleware
router.get("/available", vehicleController.getAvailableVehicles);

// ---------------- Booking Count Routes ----------------
// Only include authMiddleware if needed inside that route
router.use("/", vehicleBookingCountRoutes);

// Owner routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware("owner"),
  uploadMiddleware.uploadArray("images", 5), // ✅ handle multiple images
  uploadMiddleware.handleUploadErrors,
  uploadMiddleware.convertFilesToBase64,     // ✅ convert uploaded files to Base64
  vehicleController.addVehicle
);

router.get(
  "/owner/vehicle",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.getVehicles
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.getVehicleById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.updateVehicle
);

router.put(
  "/:id/images",
  authMiddleware,
  roleMiddleware("owner"),
  uploadMiddleware.uploadArray("images", 5), // ✅ handle multiple images
  uploadMiddleware.handleUploadErrors,
  uploadMiddleware.convertFilesToBase64,     // ✅ convert uploaded files to Base64
  vehicleController.updateVehicleImagesOnly
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.updateVehicleStatus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.deleteVehicle
);

// Customer routes
// Get available vehicles by a specific owner - getting access denied error
router.get(
  "/owner/:id/available",
  authMiddleware,
  roleMiddleware("customer"), 
  vehicleController.getAvailableVehiclesByOwner
);

// Admin routes
router.get(
  "/admin/available",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllAvailableVehicles
);

router.get(
  "/admin/unavailable",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllUnavailableVehicles
);

router.get(
  "/admin/unverified",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllUnvarifiedVehicles
);

// this route is for admin to verify vehicle
router.patch(
  "/:id/verify",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.adminVerifyVehicle
);

router.put(
  "/:id/verification",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.adminUpdateVerificationStatus
);

module.exports = router;
