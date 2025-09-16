const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/isAdmin");
const { authMiddleware } = require("../middlewares/authMiddleware"); // import auth
const {
  adminLogin,             // <-- add this
  verifyUser,
  verifyVehicle,
  updateAccountStatus,
  deleteUser,
  getAllComplaints,
  resolveComplaint,
  getDashboardStats,
  generateBookingReport,
} = require("../controllers/adminController");

// **Admin Login route (no auth needed)**
router.post("/login", adminLogin);

// Apply auth and admin middleware to all other admin routes
router.use(authMiddleware, isAdmin);

// User Verification
router.patch("/users/:id/verify", verifyUser);

// Vehicle Verification
router.patch("/vehicles/:id/verify", verifyVehicle);

// Manage Accounts
router.patch("/users/:id/status", updateAccountStatus);

// Delete User
router.delete("/users/:id", deleteUser);

// Complaints
router.get("/complaints", getAllComplaints);
router.patch("/complaints/:id", resolveComplaint);

// Dashboard Stats
router.get("/dashboard/stats", getDashboardStats);

// Reports
router.get("/reports/bookings", generateBookingReport);

module.exports = router;
