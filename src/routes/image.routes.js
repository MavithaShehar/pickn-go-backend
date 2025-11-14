const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware"); // ✅ multer
const authMiddleware = require("../middlewares/authMiddleware"); // ✅ FIXED: no {}
const { uploadProfilePhotoById, uploadVehicleImagesById } = require("../controllers/image.controller");

// 1️⃣ Upload Profile Photo by userId
router.put(
  "/profile/:userId/upload-photo",
  authMiddleware,
  (req, res, next) => {
    req.uploadType = "profile";
    next();
  },
  upload.single("photo"),
  uploadProfilePhotoById
);

// 2️⃣ Upload Vehicle Images by vehicleId
router.post(
  "/vehicle/:vehicleId/upload-images",
  authMiddleware,
  (req, res, next) => {
    req.uploadType = "vehicle";
    next();
  },
  upload.array("images", 5),
  uploadVehicleImagesById
);

module.exports = router;
