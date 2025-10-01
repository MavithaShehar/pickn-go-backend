const Vehicle = require("../models/vehicle.model");
const Booking = require("../models/booking.model");

// Get booking count for each vehicle
async function getBookingCountByVehicle() {
  // Aggregate bookings by vehicleId
  const bookingCounts = await Booking.aggregate([
    { 
      $group: { 
        _id: "$vehicleId", 
        count: { $sum: 1 } 
      } 
    }
  ]);

  // Populate vehicle info
  const results = await Promise.all(
    bookingCounts.map(async (b) => {
      const vehicle = await Vehicle.findById(b._id).select("title year ownerId");
      return {
        vehicleId: b._id,
        title: vehicle?.title || "Unknown",
        year: vehicle?.year || null,
        ownerId: vehicle?.ownerId || null,
        bookingCount: b.count,
      };
    })
  );

  return results;
}

module.exports = { getBookingCountByVehicle };
