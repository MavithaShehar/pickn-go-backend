const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  deleteProfile,
  adminDeleteUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected
router.get("/profile", authMiddleware, getProfile);
router.delete("/profile", authMiddleware, deleteProfile);
// router.put("/verify/:id", protect, admin, adminVerifyVehicle);



// Admin
// Admin: Get all users
router.get("/alluser", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), adminDeleteUser);

module.exports = router;
