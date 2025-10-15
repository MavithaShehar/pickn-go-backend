const express = require("express");
const {
  createBooking,
  updateBooking,
  deleteBooking,
  getCustomerBookings,
  getOwnerBookings,
  manageBookingByOwner,
  getBookingStatus,
  getBookingById,
  getConfirmedBookings,
  getOwnerRentalHistory,
  getOwnerOngoingBookings,
  getOwnerUpcomingBookings,
  getOwnerCompletedBookings,
  confirmBooking,
  requestHandover,
  acceptHandover,
   getOwnerContactDetails,  // ✅ Add this line

} = require("../controllers/booking.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/upload"); // multer middleware

const router = express.Router();

// =====================
// Customer Routes
// =====================

// Create a booking
router.post("/", authMiddleware, roleMiddleware("customer","owner"), createBooking);

// Get all bookings for logged-in customer
router.get("/customer", authMiddleware, roleMiddleware("customer", "owner"), getCustomerBookings);

// Get booking status by ID for customer
router.get("/:id/status", authMiddleware, roleMiddleware("customer"), getBookingStatus);

// For customers
router.get("/customer/:id", authMiddleware, roleMiddleware("customer"), getBookingById);


// Update a booking (customer)
router.put("/:id", authMiddleware, roleMiddleware("customer","owner"), updateBooking);

// Delete a booking (customer)
router.delete("/:id", authMiddleware, roleMiddleware("customer","owner"), deleteBooking);

// Customer sends handover request
router.put("/:id/request-handover", authMiddleware,roleMiddleware("customer"), requestHandover);

// Get owner contact details by owner ID
router.get("/customer/owner/:ownerId",authMiddleware,roleMiddleware("customer"), getOwnerContactDetails);

// =====================
// Owner Routes
// =====================

// Rental history (past bookings)
router.get("/owner/history", authMiddleware, roleMiddleware("owner"), getOwnerRentalHistory);

// Ongoing bookings
router.get("/owner/ongoing", authMiddleware, roleMiddleware("owner"), getOwnerOngoingBookings);

// Upcoming bookings
router.get("/owner/upcoming", authMiddleware, roleMiddleware("owner"), getOwnerUpcomingBookings);

// Completed bookings
router.get("/owner/completed", authMiddleware, roleMiddleware("owner"), getOwnerCompletedBookings);

// Get all bookings for owner
router.get("/owner", authMiddleware, roleMiddleware("owner"), getOwnerBookings);

// For owners
router.get("/owner/:id", authMiddleware, roleMiddleware("owner"), getBookingById);

// Owner manages a booking (confirm/cancel)
router.put("/owner/:id", authMiddleware, roleMiddleware("owner"), manageBookingByOwner);

// Owner confirms booking with mileage + start odometer
router.put("/owner/:id/confirm", authMiddleware, roleMiddleware("owner"), confirmBooking);

// Owner accepts handover
router.put("/owner/:id/accept-handover", authMiddleware, roleMiddleware("owner"), acceptHandover);


// =====================
// Admin Routes
// =====================

// Get all confirmed bookings
router.get("/admin/confirmed", authMiddleware, roleMiddleware("admin"), getConfirmedBookings);

module.exports = router;
