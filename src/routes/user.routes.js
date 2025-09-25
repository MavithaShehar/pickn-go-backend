// routes/user.routes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  editProfile,
  deleteProfile,
  adminDeleteUser,
  forgotPassword,
  resetPassword,
  adminVerifyUser,
  adminSuspendUser,
  getUnverifiedUsers,
  getAllUsers,
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ✅ use your single validator file
const {
  validateUser,
  validateResetPassword,
  validateEditProfile,
  handleValidation,   // <— add this
} = require("../middlewares/validateUser");

const router = express.Router();

// Public
router.post("/register", validateUser, handleValidation, registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validateResetPassword, handleValidation, resetPassword);

// Protected
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validateEditProfile, handleValidation, editProfile);
router.delete("/profile", authMiddleware, deleteProfile);

// Admin
router.get("/alluser", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), adminDeleteUser);
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), adminVerifyUser);
router.patch("/:id/suspend", authMiddleware, roleMiddleware("admin"), adminSuspendUser);
router.get("/unverified", authMiddleware, roleMiddleware("admin"), getUnverifiedUsers);

module.exports = router;
