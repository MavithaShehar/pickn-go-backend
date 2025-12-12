const Booking = require("../models/booking.model");
const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");

// Helper: normalize to local date midnight (no time part)
function toDateOnly(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Create booking
// async function createBooking(vehicleId, customerId, bookingStartDate, bookingEndDate) {
//   const vehicle = await Vehicle.findById(vehicleId);
//   if (!vehicle) throw new Error("Vehicle not found");
//   if (vehicle.status !== "available") throw new Error("Vehicle is not available");

//   // pricePerDay fallback: prefer pricePerDay, otherwise use price
//   const pricePerDay = (typeof vehicle.pricePerDay !== "undefined") ? vehicle.pricePerDay : vehicle.price;
//   if (pricePerDay == null || isNaN(pricePerDay)) throw new Error("Vehicle price per day is not defined");

//   const today = toDateOnly(new Date());

//   const start = toDateOnly(bookingStartDate);
//   const end = toDateOnly(bookingEndDate);

//   if (start < today) throw new Error("Start date cannot be in the past");
//   if (end <= start) throw new Error("End date must be after start date");

//   const existingBooking = await Booking.findOne({
//     vehicleId,
//     customerId,
//     bookingStatus: { $in: ["pending", "confirmed"] },
//   });
//   if (existingBooking) throw new Error("You have already booked this vehicle");

//   // dayCount = number of days between start and end (end exclusive)
//   const dayCount = Math.round((end - start) / MS_PER_DAY);
//   if (dayCount < 1) throw new Error("Booking must be at least 1 day");

//   const totalPrice = dayCount * Number(pricePerDay);

//   const booking = new Booking({
//     vehicleId,
//     customerId,
//     bookingStartDate: start,
//     bookingEndDate: end,
//     totalPrice,
//     bookingStatus: "pending",
//   });

//   await booking.save();

//   // mark vehicle unavailable
//   vehicle.status = "unavailable";
//   await vehicle.save();

//   return booking;
// }


// Create booking
async function createBooking(vehicleId, userId, bookingStartDate, bookingEndDate, startLocation, endLocation) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new Error("Vehicle not found");
  if (vehicle.status !== "available") throw new Error("Vehicle is not available");

  // 🚫 Restrict owner from booking his/her own vehicle
  if (vehicle.ownerId.toString() === userId.toString()) {
    throw new Error("You cannot book your own vehicle");
  }

  // ✅ Allow both customers and owners to book, but customers must be verified
  if (user.role === "customer" && !user.verificationStatus) {
    throw new Error("Only verified customers can make bookings");
  }
  if (user.role !== "customer" && user.role !== "owner") {
    throw new Error("Unauthorized role");
  }

  // pricePerDay fallback
  const pricePerDay = (typeof vehicle.pricePerDay !== "undefined") ? vehicle.pricePerDay : vehicle.price;
  if (pricePerDay == null || isNaN(pricePerDay)) throw new Error("Vehicle price per day is not defined");

   // normalize dates to UTC midnight (avoid timezone shifts when converting to ISO)
  const toDateOnlyUTC = (dateInput) => {
    const d = new Date(dateInput);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  };

  const today = toDateOnlyUTC(new Date());
  const start = toDateOnlyUTC(bookingStartDate);
  const end = toDateOnlyUTC(bookingEndDate);
  if (start < today) throw new Error("Start date cannot be in the past");
  if (end <= start) throw new Error("End date must be after start date");

  

  const dayCount = Math.round((end - start) / MS_PER_DAY);
  if (dayCount < 1) throw new Error("Booking must be at least 1 day");

  const totalPrice = dayCount * Number(pricePerDay);

// ----------------------------------------------------
  // --- ROBUST BOOKING CODE GENERATION (FIXED WITH RETRY) ---
  // ----------------------------------------------------
  let booking = null;
  let retries = 5;

  while (retries > 0 && !booking) {
    try {
      const currentDate = new Date();
      const datePart = currentDate
        .toISOString()
        .split("T")[0]
        .replace(/-/g, ""); // e.g., 20251027

      // 1. Find the last booking code starting with today's date prefix
      const bookingPrefix = `BOOK-${datePart}-`;

      const lastBooking = await Booking.findOne({
        bookingCode: { $regex: `^${bookingPrefix}` },
      })
        .sort({ bookingCode: -1 })
        .limit(1);

      let nextSequenceNumber = 1;

      if (lastBooking && lastBooking.bookingCode) {
        try {
          const parts = lastBooking.bookingCode.split("-");
          const lastNumberStr = parts[parts.length - 1];
          const lastNumber = parseInt(lastNumberStr, 10);

          if (!isNaN(lastNumber)) {
            nextSequenceNumber = lastNumber + 1;
          }
        } catch (e) {
          console.error("Error parsing last booking code, defaulting to 1", e);
        }
      }

      // 2. Format the new sequence number
      const sequenceNumber = String(nextSequenceNumber).padStart(6, "0");
      const bookingCode = `BOOK-${datePart}-${sequenceNumber}`;

      // 3. Create booking with the generated code
      booking = new Booking({
        bookingCode,
        vehicleId,
        customerId: userId,
        bookingStartDate: start,
        bookingEndDate: end,
        totalPrice,
        bookingStatus: "pending",
        startLocation,
        endLocation,
      });

      await booking.save();

      // If save succeeds, break the loop
      break;
    } catch (error) {
      // If it's a duplicate key error, retry with incremented sequence
      if (error.code === 11000 && error.message.includes("bookingCode")) {
        retries--;
        if (retries === 0) {
          throw new Error(
            "Failed to generate unique booking code after multiple attempts"
          );
        }
        // Wait a small random time before retry to avoid collision
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 100)
        );
        continue;
      }
      // If it's a different error, throw it
      throw error;
    }
  }
  // ----------------------------------------------------

  // Populate vehicleId before returning (fix undefined in emails)
  return await booking.populate("vehicleId");
}

// Customer edit booking
async function updateBooking(bookingId, customerId, updates) {
 const booking = await Booking.findOne({ _id: bookingId, customerId });
if (!booking) throw new Error("Booking not found or not owned by you");

  // ✅ normalize date to UTC midnight
  const toDateOnly = (dateInput) => {
    const d = new Date(dateInput);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  };

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
  if (updates.startLocation) booking.startLocation = updates.startLocation;
  if (updates.endLocation) booking.endLocation = updates.endLocation;

  // Recalculate totalPrice using current vehicle price
  const vehicle = await Vehicle.findById(booking.vehicleId);
  const pricePerDay = (typeof vehicle.pricePerDay !== "undefined") ? vehicle.pricePerDay : vehicle.price;
  if (pricePerDay == null || isNaN(pricePerDay)) throw new Error("Vehicle price per day is not defined");

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const dayCount = Math.round((booking.bookingEndDate - booking.bookingStartDate) / MS_PER_DAY);
  if (dayCount < 1) throw new Error("Booking must be at least 1 day");

  booking.totalPrice = dayCount * Number(pricePerDay);

  await booking.save();
  return booking.populate("vehicleId");
}

// Customer delete booking
async function deleteBooking(bookingId, customerId) {
  const booking = await Booking.findOneAndDelete({ _id: bookingId, customerId });
if (!booking) throw new Error("Booking not found or not owned by you");

  // Make vehicle available again
  await Vehicle.findByIdAndUpdate(booking.vehicleId, { status: "available" });
  return booking;
}

// ================================
// Customer: Get Owner Contact Details
// ================================
async function getOwnerContactDetails(ownerId) {
  const owner = await User.findById(ownerId).select("firstName lastName phoneNumber");
  if (!owner) throw new Error("Owner not found");

  return {
    firstName: owner.firstName,
    lastName: owner.lastName,
    phoneNumber: owner.phoneNumber,
  };
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
  }
  else if (action === "complete") {
    booking.bookingStatus = "completed";
    vehicle.status = "available";
    await vehicle.save();
  }  else {
    throw new Error("Invalid action");
  }

  await booking.save();
  return booking.populate("vehicleId");
}

// Customer bookings (excluding cancelled) — short response
async function getCustomerBookings(customerId) {
  const bookings = await Booking.find({ customerId, bookingStatus: { $ne: "cancelled" } })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" });

  return bookings.map(b => {
    // 💡 FIX: Check if b.vehicleId exists before accessing its properties
    const vehicleDetails = b.vehicleId 
      ? { 
          _id: b.vehicleId._id, 
          title: b.vehicleId.title, 
          year: b.vehicleId.year 
        } 
      : { 
          _id: 'deleted', 
          title: 'Vehicle Not Found', 
          year: 'N/A' 
        }; // Provide fallback details

    return {
      _id: b._id,
      bookingCode: b.bookingCode,
      vehicleId: vehicleDetails, // Use the safe details object
      bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
      bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      startLocation: b.startLocation,
      endLocation: b.endLocation,
    };
  });
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
    bookingCode: b.bookingCode,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    customerId: { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
    startLocation: b.startLocation,
    endLocation: b.endLocation,
  }));
}

// Admin: get all confirmed bookings
async function getConfirmedBookings() {
  const bookings = await Booking.find({ bookingStatus: "confirmed" })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  return bookings.map(b => ({
    _id: b._id,
    bookingCode: b.bookingCode,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    customerId: { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
    startLocation: b.startLocation,
    endLocation: b.endLocation,
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

// owner and customer get by speicfic id
async function getBookingById(userId, bookingId) {
  const booking = await Booking.findById(bookingId)
    .populate({ path: "vehicleId", select: "_id title year ownerId pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  if (!booking) throw new Error("Booking not found");

  // 🔹 Check access
  const isOwner = booking.vehicleId.ownerId.toString() === userId;
  const isCustomer = booking.customerId._id.toString() === userId;

  if (!isOwner && !isCustomer) {
    throw new Error("Not authorized");
  }

  return {
    _id: booking._id,
    bookingCode: booking.bookingCode,
    vehicleId: {
      _id: booking.vehicleId._id,
      title: booking.vehicleId.title,
      year: booking.vehicleId.year,
    },
    customerId: {
      _id: booking.customerId._id,
      name: `${booking.customerId.firstName} ${booking.customerId.lastName}`,
    },
    bookingStartDate: booking.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: booking.bookingEndDate.toISOString().split("T")[0],
    totalPrice: booking.totalPrice,
    bookingStatus: booking.bookingStatus,
    startLocation: booking.startLocation,
    endLocation: booking.endLocation,
  };
}

// Owner: Rental History (past bookings)
async function getOwnerRentalHistory(ownerId) {
  const vehicles = await Vehicle.find({ ownerId });
  const vehicleIds = vehicles.map(v => v._id);

  const today = new Date();

  const bookings = await Booking.find({
    vehicleId: { $in: vehicleIds },
    bookingEndDate: { $lt: today } // past bookings
  })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  return bookings.map(b => ({
    _id: b._id,
    bookingCode: b.bookingCode,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    customerId: { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
    startLocation: b.startLocation,
    endLocation: b.endLocation,
  }));
}

// Owner: Ongoing bookings (status confirmed & current date within booking range)
async function getOwnerOngoingBookings(ownerId) {
  const vehicles = await Vehicle.find({ ownerId });
  const vehicleIds = vehicles.map(v => v._id);

  const today = new Date();

  const bookings = await Booking.find({
    vehicleId: { $in: vehicleIds },
    bookingStatus: "confirmed",
    bookingStartDate: { $lte: today },
    bookingEndDate: { $gte: today },
  })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  return bookings.map(b => ({
    _id: b._id,
    bookingCode: b.bookingCode,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    customerId: { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
    startLocation: b.startLocation,
    endLocation: b.endLocation,
  }));
}

// Owner: Upcoming bookings (all statuses, start date in future)
async function getOwnerUpcomingBookings(ownerId) {
  const vehicles = await Vehicle.find({ ownerId });
  const vehicleIds = vehicles.map(v => v._id);

  const today = new Date();

  const bookings = await Booking.find({
    vehicleId: { $in: vehicleIds },
    bookingStartDate: { $gt: today }, // only future bookings
  })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  return bookings.map(b => ({
    _id: b._id,
    bookingCode: b.bookingCode,
    vehicleId: { 
      _id: b.vehicleId._id, 
      title: b.vehicleId.title, 
      year: b.vehicleId.year 
    },
    customerId: { 
      _id: b.customerId._id, 
      name: `${b.customerId.firstName} ${b.customerId.lastName}` 
    },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    bookingStatus: b.bookingStatus,
    startLocation: b.startLocation,
    endLocation: b.endLocation,
  }));
}


// Owner: Completed bookings (status completed)
async function getOwnerCompletedBookings(ownerId) {
  const vehicles = await Vehicle.find({ ownerId });
  const vehicleIds = vehicles.map(v => v._id);

  const bookings = await Booking.find({
    vehicleId: { $in: vehicleIds },
    bookingStatus: "completed",
  })
    .populate({ path: "vehicleId", select: "_id title year pricePerDay" })
    .populate({ path: "customerId", select: "_id firstName lastName" });

  return bookings.map(b => ({
    _id: b._id,
    bookingCode: b.bookingCode,
    vehicleId: { _id: b.vehicleId._id, title: b.vehicleId.title, year: b.vehicleId.year },
    customerId: { _id: b.customerId._id, name: `${b.customerId.firstName} ${b.customerId.lastName}` },
    bookingStartDate: b.bookingStartDate.toISOString().split("T")[0],
    bookingEndDate: b.bookingEndDate.toISOString().split("T")[0],
    totalPrice: b.totalPrice,
    extraCharge: b.extraCharge,
    ratePerKm: b.ratePerKm,
    bookingStatus: b.bookingStatus,
    startLocation: b.startLocation,
    endLocation: b.endLocation,
  }));
}

// Confirm booking (owner sets agreed mileage + start odometer)
async function confirmBooking(bookingId, ownerId, { agreedMileage, startOdometer }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const vehicle = await Vehicle.findById(booking.vehicleId);
  if (!vehicle || vehicle.ownerId.toString() !== ownerId) throw new Error("Not authorized");

  booking.agreedMileage = agreedMileage;
  booking.startOdometer = startOdometer;
  booking.bookingStatus = "ongoing";

  await booking.save();
  return booking;
}

// Customer sends handover request
async function requestHandover(bookingId, customerId) {
  const booking = await Booking.findOne({ _id: bookingId, customerId });
  if (!booking) throw new Error("Booking not found or not authorized");

  booking.handoverRequest = true;
  await booking.save();
  return booking;
}

// Owner accepts handover and completes booking
async function acceptHandover(bookingId, ownerId, { endOdometer, ratePerKm }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const vehicle = await Vehicle.findById(booking.vehicleId);
  if (!vehicle || vehicle.ownerId.toString() !== ownerId) throw new Error("Not authorized");

  // Mileage calculations
  booking.endOdometer = endOdometer;
  booking.totalMileageUsed = endOdometer - booking.startOdometer;
  booking.extraMileage = Math.max(0, booking.totalMileageUsed - booking.agreedMileage);
  
  
// Store both rate and charge
  booking.ratePerKm = ratePerKm;
  booking.extraCharge = booking.extraMileage * ratePerKm;

  booking.bookingStatus = "completed";
  vehicle.status = "available";

  await vehicle.save();
  await booking.save();

  return booking;
}

// Change booking status
const updateBookingStatus = async (id, status) => {
  const allowedStatuses = ["completed", "confirmed", "ongoing", "pending", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    { bookingStatus: status }, 
    { new: true }
  );

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};



module.exports = {
  createBooking,
  updateBooking,
  deleteBooking,
  getCustomerBookings,
  getOwnerBookings,
  manageBookingByOwner,
  getBookingStatus,
  getConfirmedBookings,
  getBookingById,
  getOwnerRentalHistory,
  getOwnerOngoingBookings,
  getOwnerUpcomingBookings,
  getOwnerCompletedBookings,
  confirmBooking,
  requestHandover,
  acceptHandover,
  getOwnerContactDetails, 
  updateBookingStatus,
};