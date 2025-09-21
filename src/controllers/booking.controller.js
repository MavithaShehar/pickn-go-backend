const bookingService = require("../services/booking.service");
const sendEmail = require("../utils/sendEmail");
const { bookingConfirmation, bookingConfirmationText } = require("../utils/emailTemplates");
const User = require("../models/user.model");

// Customer
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, bookingStartDate, bookingEndDate } = req.body;
    const booking = await bookingService.createBooking(
      vehicleId,
      req.user.id,
      bookingStartDate,
      bookingEndDate
    );

    // ✅ Send email notification only after booking is created
    try {
      const customer = await User.findById(req.user.id);
      if (customer && customer.email) {
        await sendEmail({
          to: customer.email,
          subject: "Booking Confirmation - PicknGo 🚗",
          text: bookingConfirmationText(customer, booking), // pass full customer
          html: bookingConfirmation(customer, booking),     // pass full customer
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

exports.updateBooking = async (req, res) => {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.user.id, req.body);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await bookingService.deleteBooking(req.params.id, req.user.id);
    res.json({ message: "Booking deleted", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.manageBookingByOwner = async (req, res) => {
  try {
    const { action } = req.body; // confirm or cancel
    const booking = await bookingService.manageBookingByOwner(req.params.id, req.user.id, action);
    // (No email notification for owner actions)
    res.json({ message: `Booking ${action}`, booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get booking status (customer only)
exports.getBookingStatus = async (req, res) => {
  try {
    const status = await bookingService.getBookingStatus(req.params.id, req.user);
    res.json(status);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getConfirmedBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getConfirmedBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner get booking using one id
exports.getOwnerBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getOwnerBookingById(req.user.id, req.params.id);
    res.json(booking);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
