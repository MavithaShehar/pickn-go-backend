const Booking = require("../models/booking.model");
const Vehicle = require("../models/vehicle.model");

// Get booking count for each vehicle
exports.getVehicleBookingCounts = async (req, res) => {
  try {
    // Fetch all vehicles for everyone (no filter)
    const vehicles = await Vehicle.find();

    // Count bookings for each vehicle
    const result = await Promise.all(
      vehicles.map(async (v) => {
        const count = await Booking.countDocuments({ vehicleId: v._id });
        return {
          vehicleId: v._id,
          title: v.title,
          year: v.year || null,
          ownerId: v.ownerId || null,
          bookingCount: count,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
