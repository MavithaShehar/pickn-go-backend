const express = require("express");
const {
  createBooking,
  updateBooking,
  deleteBooking,
  getCustomerBookings,
  getOwnerBookings,
  manageBookingByOwner,
  getBookingStatus,
  getOwnerBookingById,
  getConfirmedBookings,
  
} = require("../controllers/booking.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/upload"); // multer middleware

const router = express.Router();

// =====================
// Customer Routes
// =====================

// Create a booking
router.post("/", authMiddleware, roleMiddleware("customer"), createBooking);

// Get all bookings for logged-in customer
router.get("/customer", authMiddleware, roleMiddleware("customer"), getCustomerBookings);

// Get booking status by ID for customer
router.get("/:id/status", authMiddleware, roleMiddleware("customer"), getBookingStatus);

// Update a booking (customer)
router.put("/:id", authMiddleware, roleMiddleware("customer"), updateBooking);

// Delete a booking (customer)
router.delete("/:id", authMiddleware, roleMiddleware("customer"), deleteBooking);


// =====================
// Owner Routes
// =====================

// Get all bookings for owner
router.get("/owner", authMiddleware, roleMiddleware("owner"), getOwnerBookings);

// Get a specific booking by ID for owner
router.get("/owner/:id", authMiddleware, roleMiddleware("owner"), getOwnerBookingById);

// Owner manages a booking (confirm/cancel)
router.put("/owner/:id", authMiddleware, roleMiddleware("owner"), manageBookingByOwner);




// =====================
// Admin Routes
// =====================

// Get all confirmed bookings
router.get("/admin/confirmed", authMiddleware, roleMiddleware("admin"), getConfirmedBookings);

module.exports = router;
