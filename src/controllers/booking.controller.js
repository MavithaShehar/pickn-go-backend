const bookingService = require("../services/booking.service");
const sendEmail = require("../utils/sendEmail");
const { bookingConfirmation, bookingConfirmationText } = require("../utils/emailTemplates");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");


// ================================
// Customer Controllers
// ================================

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, bookingStartDate, bookingEndDate } = req.body;
    const booking = await bookingService.createBooking(
      vehicleId,
      req.user.id,
      bookingStartDate,
      bookingEndDate
    );

    // Send booking confirmation email
    try {
      const customer = await User.findById(req.user.id);
      if (customer && customer.email) {
        await sendEmail({
          to: customer.email,
          subject: "Booking Confirmation - PicknGo 🚗",
          text: bookingConfirmationText(customer, booking),
          html: bookingConfirmation(customer, booking),
        });
        console.log("✅ Booking confirmation email sent to:", customer.email);
      } else {
        console.warn("⚠️ No email found for user:", req.user.id);
      }
    } catch (emailErr) {
      console.error("❌ Email send failed:", emailErr.message);
    }

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a booking (customer)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.user.id, req.body);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a booking (customer)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await bookingService.deleteBooking(req.params.id, req.user.id);
    res.json({ message: "Booking deleted", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bookings for logged-in customer
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get booking status by ID (customer)
exports.getBookingStatus = async (req, res) => {
  try {
    const status = await bookingService.getBookingStatus(req.params.id, req.user);
    res.json(status);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ================================
// Owner Controllers
// ================================

// Get all bookings for owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner manages a booking (confirm/cancel)
exports.manageBookingByOwner = async (req, res) => {
  try {
    const { action } = req.body; // confirm or cancel
    const booking = await bookingService.manageBookingByOwner(req.params.id, req.user.id, action);
    res.json({ message: `Booking ${action}`, booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a specific booking by ID for owner
exports.getOwnerBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getOwnerBookingById(req.user.id, req.params.id);
    res.json(booking);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Rental History (past bookings)
exports.getOwnerRentalHistory = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerRentalHistory(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ongoing bookings
exports.getOwnerOngoingBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerOngoingBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upcoming bookings
exports.getOwnerUpcomingBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerUpcomingBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Completed bookings
exports.getOwnerCompletedBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerCompletedBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// Admin Controllers
// ================================

// Get all confirmed bookings
exports.getConfirmedBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getConfirmedBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};






