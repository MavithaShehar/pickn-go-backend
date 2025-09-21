const Booking = require("../models/booking.model");
const Vehicle = require("../models/vehicle.model");

// Helper: normalize to local date midnight (no time part)
function toDateOnly(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Create booking
async function createBooking(vehicleId, customerId, bookingStartDate, bookingEndDate) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new Error("Vehicle not found");
  if (vehicle.status !== "available") throw new Error("Vehicle is not available");

  // pricePerDay fallback
  const pricePerDay = (typeof vehicle.pricePerDay !== "undefined") ? vehicle.pricePerDay : vehicle.price;
  if (pricePerDay == null || isNaN(pricePerDay)) throw new Error("Vehicle price per day is not defined");

  const today = toDateOnly(new Date());
  const start = toDateOnly(bookingStartDate);
  const end = toDateOnly(bookingEndDate);

  if (start < today) throw new Error("Start date cannot be in the past");
  if (end <= start) throw new Error("End date must be after start date");

  const existingBooking = await Booking.findOne({
    vehicleId,
    customerId,
    bookingStatus: { $in: ["pending", "confirmed"] },
  });
  if (existingBooking) throw new Error("You have already booked this vehicle");

  const dayCount = Math.round((end - start) / MS_PER_DAY);
  if (dayCount < 1) throw new Error("Booking must be at least 1 day");

  const totalPrice = dayCount * Number(pricePerDay);

  const booking = new Booking({
    vehicleId,
    customerId,
    bookingStartDate: start,
    bookingEndDate: end,
    totalPrice,
    bookingStatus: "pending",
  });

  await booking.save();

  // mark vehicle unavailable
  vehicle.status = "unavailable";
  await vehicle.save();

  // 🔹 Populate vehicleId before returning (fix undefined in emails)
  return await booking.populate("vehicleId");
}

// Customer edit booking
async function updateBooking(bookingId, customerId, updates) {
  const booking = await Booking.findOne({ _id: bookingId, customerId });
  if (!booking) throw new Error("Booking not found");

  if (updates.bookingStartDate) {
    const start = toDateOnly(updates.bookingStartDate);
    const today = toDateOnly(new Date());
    if (start < today) throw new Error("Start date cannot be in the past");
    booking.bookingStartDate = start;
  }

  if (updates.bookingEndDate) {
    const end = toDateOnly(updates.bookingEndDate);
    if (end <= booking.bookingStartDate) throw new Error("End date must be after start date");
    booking.bookingEndDate = end;
  }

  // Recalculate totalPrice using current vehicle price
  const vehicle = await Vehicle.findById(booking.vehicleId);
  const pricePerDay = (typeof vehicle.pricePerDay !== "undefined") ? vehicle.pricePerDay : vehicle.price;
  if (pricePerDay == null || isNaN(pricePerDay)) throw new Error("Vehicle price per day is not defined");

  const dayCount = Math.round((booking.bookingEndDate - booking.bookingStartDate) / MS_PER_DAY);
  if (dayCount < 1) throw new Error("Booking must be at least 1 day");

  booking.totalPrice = dayCount * Number(pricePerDay);

  await booking.save();
  return booking.populate("vehicleId");
}

// Customer delete booking
async function deleteBooking(bookingId, customerId) {
  const booking = await Booking.findOneAndDelete({ _id: bookingId, customerId });
  if (!booking) throw new Error("Booking not found or cannot delete");

  // Make vehicle available again
  await Vehicle.findByIdAndUpdate(booking.vehicleId, { status: "available" });
  return booking;
}

// Owner manage booking (confirm/cancel only for their vehicle)
async function manageBookingByOwner(bookingId, ownerId, action) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const vehicle = await Vehicle.findById(booking.vehicleId);
  if (!vehicle || vehicle.ownerId.toString() !== ownerId) throw new Error("Not authorized");

  if (action === "confirm") {
    booking.bookingStatus = "confirmed";
  } else if (action === "cancel") {
    booking.bookingStatus = "cancelled";
    vehicle.status = "available";
    await vehicle.save();
  } else {
    throw new Error("Invalid action");
  }

  await booking.save();
  return booking.populate("vehicleId");
}

// Customer bookings (excluding cancelled) — short response
async function getCustomerBookings(customerId) {
  const bookings = await Booking.find({ customerId, bookingStatus: { $ne: "cancelled" } })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" });

  return bookings.map(b => ({
    _id: b._id,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
  }));
}

// Owner bookings — short response
async function getOwnerBookings(ownerId) {
  const vehicles = await Vehicle.find({ ownerId });
  const vehicleIds = vehicles.map(v => v._id);

  const bookings = await Booking.find({ vehicleId: { $in: vehicleIds } })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  return bookings.map(b => ({
    _id: b._id,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    customerId: { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
  }));
}

// Admin: get all confirmed bookings
async function getConfirmedBookings() {
  const bookings = await Booking.find({ bookingStatus: "confirmed" })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  return bookings.map(b => ({
    _id: b._id,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    customerId: { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
  }));
}

// Get booking status (customer or owner as appropriate)
async function getBookingStatus(bookingId, user) {
  const booking = await Booking.findById(bookingId).populate("vehicleId");
  if (!booking) throw new Error("Booking not found");

  if (user.role === "customer" && booking.customerId.toString() !== user.id) {
    throw new Error("Not authorized");
  }

  return { bookingStatus: booking.bookingStatus };
}

// Owner get single booking
async function getOwnerBookingById(ownerId, bookingId) {
  const booking = await Booking.findById(bookingId)
    .populate({ path: "vehicleId", select: "_id title year ownerId pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  if (!booking) throw new Error("Booking not found");

  if (booking.vehicleId.ownerId.toString() !== ownerId) {
    throw new Error("Not authorized");
  }

  return {
    _id: booking._id,
    vehicleId: { _id: booking.vehicleId._id, title: booking.vehicleId.title, year: booking.vehicleId.year },
    customerId: { _id: booking.customerId._id, name: `${booking.customerId.firstName} ${booking.customerId.lastName}` },
    bookingStartDate: booking.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: booking.bookingEndDate.toISOString().split("T")[0],
    totalPrice: booking.totalPrice,
    bookingStatus: booking.bookingStatus,
  };
}

module.exports = {
  createBooking,
  updateBooking,
  deleteBooking,
  getCustomerBookings,
  getOwnerBookings,
  manageBookingByOwner,
  getBookingStatus,
  getConfirmedBookings,
  getOwnerBookingById,
};
