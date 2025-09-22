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
const { handleContactSubmission } = require("../utils/Contactusemail");

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

// Contact form route
router.post("/contact", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  try {
    await handleContactSubmission({ firstName, lastName, email, phone, message });
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(400).json({ error: error.message || "Failed to send message" });
  }
});

module.exports = router;