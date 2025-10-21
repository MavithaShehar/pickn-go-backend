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
    const { vehicleId, bookingStartDate, bookingEndDate, startLocation,endLocation } = req.body;
    const booking = await bookingService.createBooking(
      vehicleId,
      req.user.id,
      bookingStartDate,
      bookingEndDate,
      startLocation,
      endLocation
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

// Customer requests handover
exports.requestHandover = async (req, res) => {
  try {
    const booking = await bookingService.requestHandover(req.params.id, req.user.id);
    res.json({ message: "Handover requested", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};// ================================
// Customer: Get Owner Contact Details (Secure)
// ================================
exports.getOwnerContactDetails = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    // ✅ Fetch the user (owner)
    const owner = await User.findById(ownerId).select("firstName lastName phoneNumber role");
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // 🚫 Block if the user is an Admin
    if (owner.role === "admin") {
      return res.status(403).json({ message: "Access denied: Admin details cannot be retrieved" });
    }

    // ✅ Return only if it's an owner
    res.json({
      firstName: owner.firstName,
      lastName: owner.lastName,
      phoneNumber: owner.phoneNumber,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

// controllers/booking.controller.js
exports.getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.user.id, req.params.id);
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

// Owner confirms booking with mileage + start odometer
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await bookingService.confirmBooking(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ message: "Booking confirmed & started", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Owner accepts handover & completes booking
exports.acceptHandover = async (req, res) => {
  try {
    const booking = await bookingService.acceptHandover(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ message: "Booking completed", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
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


// ================================
// PATCH: Update Booking Status
// ================================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["completed", "confirmed", "ongoing", "pending", "cancel"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedBooking = await bookingService.updateBookingStatus(id, status);
    res.status(200).json({
      message: `Booking status updated to '${status}' successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};