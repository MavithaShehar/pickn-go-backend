const bookingService = require("../services/booking.service");

// Customer
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, bookingStartDate, bookingEndDate } = req.body;
    const booking = await bookingService.createBooking(vehicleId, req.user.id, bookingStartDate, bookingEndDate);
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
//owner get booking using one id
exports.getOwnerBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getOwnerBookingById(req.user.id, req.params.id);
    res.json(booking);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
