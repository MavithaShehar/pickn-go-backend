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
  adminVerifyVehicle,
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



// Admin
// Admin: Get all users
router.get("/alluser", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), adminDeleteUser);
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), adminVerifyUser);
router.patch("/:id/suspend", authMiddleware, roleMiddleware("admin"), adminSuspendUser);
router.get("/unverified", authMiddleware, roleMiddleware("admin"), getUnverifiedUsers);


module.exports = router;
