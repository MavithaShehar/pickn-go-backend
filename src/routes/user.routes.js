const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  deleteProfile,
  adminDeleteUser,
  forgotPassword,
  resetPassword,
  getOwnerDetails,
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
router.delete("/:id", authMiddleware, roleMiddleware("admin"), adminDeleteUser);
// Customer: View owner details
router.get("/owner-details/:ownerId", authMiddleware, roleMiddleware("customer"), getOwnerDetails);

module.exports = router;
