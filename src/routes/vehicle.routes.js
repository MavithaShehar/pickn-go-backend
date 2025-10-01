const express = require("express");
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const vehicleBookingCountRoutes = require("./vehicleBookingCount.routes");
const uploadMiddleware = require("../middlewares/uploadMiddleware"); // ✅ add this

const router = express.Router();

// ---------------- Public Route ----------------
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
  vehicleController.addVehicle
);

router.get("/owner/my", authMiddleware, roleMiddleware("owner"), vehicleController.getVehicles);
router.get("/:id", authMiddleware, roleMiddleware("owner"), vehicleController.getVehicleById);
router.put("/:id", authMiddleware, roleMiddleware("owner"), vehicleController.updateVehicle);

router.put(
  "/:id/images",
  authMiddleware,
  roleMiddleware("owner"),
  uploadMiddleware.uploadArray("images", 5), // ✅ handle multiple images
  uploadMiddleware.handleUploadErrors,
  vehicleController.updateVehicleImagesOnly
);

router.put("/:id/status", authMiddleware, roleMiddleware("owner"), vehicleController.updateVehicleStatus);
router.delete("/:id", authMiddleware, roleMiddleware("owner"), vehicleController.deleteVehicle);

// Customer routes
router.get("/available", vehicleController.getAvailableVehicles);
router.get("/owner/:id/available", authMiddleware, roleMiddleware("customer"), vehicleController.getAvailableVehiclesByOwner);

// Admin routes
router.get("/admin/available", authMiddleware, roleMiddleware("admin"), vehicleController.getAllAvailableVehicles);
router.get("/admin/unavailable", authMiddleware, roleMiddleware("admin"), vehicleController.getAllUnavailableVehicles);
router.get("/admin/unverified", authMiddleware, roleMiddleware("admin"), vehicleController.getAllUnvarifiedVehicles);
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), vehicleController.adminVerifyVehicle);
router.put("/:id/verification", authMiddleware, roleMiddleware("admin"), vehicleController.adminUpdateVerificationStatus);

module.exports = router;
