// routes/user.routes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  deleteProfile,
  adminDeleteUser,
  forgotPassword,
  resetPassword,
  adminVerifyUser,
  adminSuspendUser,
  getUnverifiedUsers,
  getAllUsers,
  updateAvatar, // <— add this
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ✅ use your single validator file
const {
  validateUser,
  validateResetPassword,
  handleValidation,   // <— add this
} = require("../middlewares/validateUser");

// Multer for avatar upload
const multer = require("multer");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};
const uploadAvatar = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).single("avatar");

const router = express.Router();

// Public
router.post("/register", validateUser, handleValidation, registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validateResetPassword, handleValidation, resetPassword);

// Protected
router.get("/profile", authMiddleware, getProfile);
router.delete("/profile", authMiddleware, deleteProfile);

// Update avatar
router.put("/profile/avatar", authMiddleware, uploadAvatar, updateAvatar); // <— new route

// Admin
router.get("/alluser", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), adminDeleteUser);
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), adminVerifyUser);
router.patch("/:id/suspend", authMiddleware, roleMiddleware("admin"), adminSuspendUser);
router.get("/unverified", authMiddleware, roleMiddleware("admin"), getUnverifiedUsers);

module.exports = router;
