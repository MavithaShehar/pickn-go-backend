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
  getConfirmedBookings ,
} = require("../controllers/booking.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Customer
router.post("/", authMiddleware, roleMiddleware("customer"), createBooking);
router.get("/customer", authMiddleware, roleMiddleware("customer"), getCustomerBookings);
router.put("/:id", authMiddleware, roleMiddleware("customer"), updateBooking);
router.delete("/:id", authMiddleware, roleMiddleware("customer"), deleteBooking);
router.get("/:id/status", authMiddleware, roleMiddleware("customer"), getBookingStatus);

// Owner
router.get("/owner", authMiddleware, roleMiddleware("owner"), getOwnerBookings);
router.get("/owner/:id", authMiddleware, roleMiddleware("owner"), getOwnerBookingById);
router.put("/owner/:id", authMiddleware, roleMiddleware("owner"), manageBookingByOwner);

// Admin confirmed bookings
router.get("/admin/confirmed",authMiddleware,roleMiddleware("admin"), getConfirmedBookings
);

module.exports = router;
