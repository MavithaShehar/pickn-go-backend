const bookingService = require("../services/booking.service");
const sendEmail = require("../utils/sendEmail");
const { bookingConfirmation, bookingConfirmationText } = require("../utils/emailTemplates");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const paginate = require("../utils/paginate");
const Vehicle = require("../models/vehicle.model"); // ✅ add this line


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

// Owner: Get Handover Requests
exports.getHandoverRequests = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    const vehicleIds = vehicles.map(v => v._id);
    
    const bookings = await Booking.find({
      vehicleId: { $in: vehicleIds },
      handoverRequest: true, 
      bookingStatus: "ongoing" // ✅ Only ongoing bookings
    })
      .populate({ path: "vehicleId", select: "_id title year" })
      .populate({ path: "customerId", select: "_id firstName lastName phoneNumber" });
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

// ================================
// Paginated Versions
// ================================

// 1️⃣ Customer - Get All Bookings (Paginated)
exports.getCustomerBookingsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(
      Booking,
      parseInt(page),
      parseInt(limit),
      { customerId: req.user.id, bookingStatus: { $ne: "cancelled" } },
      [{ path: "vehicleId", select: "_id title year pricePerDay" }]
    );

    // Transform response
    const formatted = result.data.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: b.vehicleId
        ? { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year }
        : { _id: "deleted", title: "Vehicle Not Found", year: "N/A" },
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    }));

    res.status(200).json({
      success: true,
      message: "Customer bookings fetched successfully (paginated)",
      bookings: formatted,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalDocuments: result.totalDocuments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2️⃣ Owner - Get All Bookings (Paginated)
exports.getOwnerBookingsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    const vehicleIds = vehicles.map(v => v._id);

    const result = await paginate(
      Booking,
      parseInt(page),
      parseInt(limit),
      { vehicleId: { $in: vehicleIds } },
      [
        { path: "vehicleId", select: "_id title year pricePerDay" },
        { path: "customerId", select: "_id firstName lastName" },
      ]
    );

    const formatted = result.data.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: b.vehicleId
        ? { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year }
        : { _id: "deleted", title: "Vehicle Not Found", year: "N/A" },
      customerId: b.customerId
        ? { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` }
        : { _id: "deleted", name: "Customer Not Found" },
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    }));

    res.status(200).json({
      success: true,
      message: "Owner bookings fetched successfully (paginated)",
      bookings: formatted,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalDocuments: result.totalDocuments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3️⃣ Admin - Get All Confirmed Bookings (Paginated)
exports.getConfirmedBookingsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(
      Booking,
      parseInt(page),
      parseInt(limit),
      { bookingStatus: "confirmed" },
      [
        { path: "vehicleId", select: "_id title year pricePerDay" },
        { path: "customerId", select: "_id firstName lastName" },
      ]
    );

    const formatted = result.data.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: b.vehicleId
        ? { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year }
        : { _id: "deleted", title: "Vehicle Not Found", year: "N/A" },
      customerId: b.customerId
        ? { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` }
        : { _id: "deleted", name: "Customer Not Found" },
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    }));

    res.status(200).json({
      success: true,
      message: "Confirmed bookings fetched successfully (paginated)",
      bookings: formatted,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalDocuments: result.totalDocuments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Rental History - Paginated
exports.getOwnerRentalHistoryPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    const vehicleIds = vehicles.map(v => v._id);

    const result = await paginate(
      Booking,
      parseInt(page),
      parseInt(limit),
      { vehicleId: { $in: vehicleIds }, bookingEndDate: { $lt: new Date() } },
      [
        { path: "vehicleId", select: "_id title year pricePerDay" },
        { path: "customerId", select: "_id firstName lastName" },
      ]
    );

    const formatted = result.data.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: b.vehicleId ? { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year } : { _id: "deleted", title: "Vehicle Not Found", year: "N/A" },
      customerId: b.customerId ? { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` } : { _id: "deleted", name: "Customer Not Found" },
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    }));

    res.json({ success: true, message: "Rental history (paginated) fetched", bookings: formatted, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Similarly for Ongoing, Upcoming, Completed:

// Ongoing Bookings - Paginated
exports.getOwnerOngoingBookingsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    const vehicleIds = vehicles.map(v => v._id);
    const today = new Date();

    const bookingsData = await Booking.find({
      vehicleId: { $in: vehicleIds },
      bookingStatus: "confirmed",
      bookingStartDate: { $lte: today },
      bookingEndDate: { $gte: today }
    })
      .populate({ path: "vehicleId", select: "_id title year" })
      .populate({ path: "customerId", select: "_id firstName lastName" })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const formatted = bookingsData.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: b.vehicleId ? { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year } : { _id: "deleted", title: "Vehicle Not Found", year: "N/A" },
      customerId: b.customerId ? { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` } : { _id: "deleted", name: "Customer Not Found" },
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    }));

    res.json({ success: true, message: "Ongoing bookings (paginated) fetched", bookings: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upcoming Bookings - Paginated
exports.getOwnerUpcomingBookingsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    const vehicleIds = vehicles.map(v => v._id);
    const today = new Date();

    const bookingsData = await Booking.find({
      vehicleId: { $in: vehicleIds },
      bookingStartDate: { $gt: today }
    })
      .populate({ path: "vehicleId", select: "_id title year" })
      .populate({ path: "customerId", select: "_id firstName lastName" })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const formatted = bookingsData.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: b.vehicleId ? { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year } : { _id: "deleted", title: "Vehicle Not Found", year: "N/A" },
      customerId: b.customerId ? { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` } : { _id: "deleted", name: "Customer Not Found" },
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    }));

    res.json({ success: true, message: "Upcoming bookings (paginated) fetched", bookings: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Completed Bookings - Paginated
exports.getOwnerCompletedBookingsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    const vehicleIds = vehicles.map(v => v._id);

    const bookingsData = await Booking.find({
      vehicleId: { $in: vehicleIds },
      bookingStatus: "completed"
    })
      .populate({ path: "vehicleId", select: "_id title year" })
      .populate({ path: "customerId", select: "_id firstName lastName" })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const formatted = bookingsData.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: b.vehicleId ? { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year } : { _id: "deleted", title: "Vehicle Not Found", year: "N/A" },
      customerId: b.customerId ? { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` } : { _id: "deleted", name: "Customer Not Found" },
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    }));

    res.json({ success: true, message: "Completed bookings (paginated) fetched", bookings: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

