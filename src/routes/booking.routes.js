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
  getHandoverRequests,
  acceptHandover,
  getOwnerContactDetails,  
  updateBookingStatus,
    // 🆕 Add these 3 lines
  getCustomerBookingsPaginated,
  getOwnerBookingsPaginated,
  getConfirmedBookingsPaginated,
  getOwnerRentalHistoryPaginated,
  getOwnerOngoingBookingsPaginated,
  getOwnerUpcomingBookingsPaginated,
  getOwnerCompletedBookingsPaginated

} = require("../controllers/booking.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/upload"); // multer middleware

const router = express.Router();

router.patch('/:id/status', authMiddleware, roleMiddleware("owner","admin"), updateBookingStatus);



// =====================
// Customer Routes
// =====================

// Create a booking
router.post("/", authMiddleware, roleMiddleware("customer","owner"), createBooking);

// Get all bookings for logged-in customer
router.get("/customer", authMiddleware, roleMiddleware("customer", "owner"), getCustomerBookings);

//paginated get all bookinngs
router.get("/customer/paginated", authMiddleware, roleMiddleware("customer"),getCustomerBookingsPaginated);

// Get booking status by ID for customer
router.get("/:id/status", authMiddleware, roleMiddleware("customer"), getBookingStatus);

// For customers
router.get("/customer/:id", authMiddleware, roleMiddleware("customer"), getBookingById);


// Update a booking (customer)
router.put("/:id", authMiddleware, roleMiddleware("customer","owner"), updateBooking);

// Delete a booking (customer)
router.delete("/:id", authMiddleware, roleMiddleware("customer","owner"), deleteBooking);

// Customer, owner sends handover request
router.put("/:id/request-handover", authMiddleware,roleMiddleware("customer","owner"), requestHandover);

// Get owner contact details by owner ID
router.get("/customer/owner/:ownerId",authMiddleware,roleMiddleware("customer", "owner"), getOwnerContactDetails);

// =====================
// Owner Routes
// =====================

//pagined see confirm all bookings

// Owner: Get handover requests
router.get("/owner/handover-requests", authMiddleware, roleMiddleware("owner"), getHandoverRequests);


router.get("/owner/paginated", authMiddleware, roleMiddleware("owner"), getOwnerBookingsPaginated);
// Owner Paginated Routes
router.get("/owner/history/paginated", authMiddleware, roleMiddleware("owner"), getOwnerRentalHistoryPaginated);
router.get("/owner/ongoing/paginated", authMiddleware, roleMiddleware("owner"), getOwnerOngoingBookingsPaginated);
router.get("/owner/upcoming/paginated", authMiddleware, roleMiddleware("owner"), getOwnerUpcomingBookingsPaginated);
router.get("/owner/completed/paginated", authMiddleware, roleMiddleware("owner"), getOwnerCompletedBookingsPaginated);


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


// 🔹 Paginated routes

router.get("/confirmed/paginated", authMiddleware, roleMiddleware("admin"), getConfirmedBookingsPaginated);



module.exports = router;
