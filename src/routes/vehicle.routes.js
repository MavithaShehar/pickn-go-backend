const express = require("express");
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const vehicleBookingCountRoutes = require("./vehicleBookingCount.routes");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ---------------- Public Routes ----------------

// Get all available vehicles
router.get("/available", vehicleController.getAvailableVehicles);

// Get available vehicles paginated
router.get(
  "/available/paginated",
  vehicleController.getAvailableVehiclesPaginated
);

// Booking Count Routes
router.use("/", vehicleBookingCountRoutes);

// ---------------- Owner Routes ----------------

// Add Vehicle (No images initially)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.addVehicle
);

// Upload Vehicle Images
router.put(
  "/:id/images",
  authMiddleware,
  roleMiddleware("owner"),
  (req, res, next) => {
    req.uploadType = "vehicle";
    next();
  },
  uploadMiddleware.array("images", 5),
  vehicleController.updateVehicleImagesOnly
);

// Owner Vehicles (Paginated)
router.get(
  "/owner/vehicle/paginated",
  authMiddleware,
  roleMiddleware("owner"),
  vehicleController.getVehiclesPaginated
);

// Owner Vehicles - All
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

// Update Vehicle
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

// Customer Paginated: Available vehicles by owner
router.get(
  "/available/by-owner/:vehicleId",
  authMiddleware,
  roleMiddleware("customer"),
  vehicleController.getPaginatedAvailableVehiclesByOwner
);

// Available vehicles by owner
router.get(
  "/owner/:id/available",
  authMiddleware,
  roleMiddleware("customer"),
  vehicleController.getAvailableVehiclesByOwner
);

// ---------------- Admin Routes ----------------

// Admin Paginated Routes
router.get(
  "/admin/available/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllAvailableVehiclesPaginated
);

router.get(
  "/admin/unavailable/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllUnavailableVehiclesPaginated
);

router.get(
  "/admin/unverified/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllUnverifiedVehiclesPaginated
);

// Admin view all
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

router.get(
  "/admin/verified",
  authMiddleware,
  roleMiddleware("admin"),
  vehicleController.getAllVerifiedVehicles
);

// Admin verify / update verification
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
