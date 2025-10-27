const mongoose = require("mongoose");
const { createAlert } = require("../services/alert.service");

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingStartDate: { type: Date, required: true },
  bookingEndDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  bookingStatus: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled", "ongoing", "completed"], 
    default: "pending" 
  },
   // New fields for start and end locations
  startLocation: { type: String, required: true }, 
  endLocation: { type: String, required: true },

  // New fields for mileage tracking
  agreedMileage: { type: Number }, // allowance
  startOdometer: { type: Number },
  endOdometer: { type: Number },
  totalMileageUsed: { type: Number },
  extraMileage: { type: Number },
  ratePerKm: { type: Number },
  extraCharge: { type: Number },

  // Handover request flag
  handoverRequest: { type: Boolean, default: false }

}, { timestamps: true });

// ✅ Detect new booking before save
bookingSchema.pre("save", function (next) {
  this._wasNew = this.isNew;
  next();
});

// ✅ Run alert only after save if it was newly created
bookingSchema.post("save", async function (doc) {
  if (this._wasNew) {
    await createAlert({
      bookingId: doc._id,
      customerId: doc.customerId,
      message: `Booking ${doc.bookingCode || doc._id} created successfully.`,
    });
  }
});

// Capture previous status before saving
bookingSchema.pre('validate', function(next) {
  if (!this.isNew) {
    this.$__.priorBookingStatus = this.get('bookingStatus');
  }
  next();
});

// Middleware to trigger alert when bookingStatus changes
bookingSchema.pre('save', async function(next) {
  // Only run if bookingStatus was modified AND this is NOT a new document
  if (!this.isNew && this.isModified('bookingStatus')) {
    let prevStatus = 'pending'; // default previous status

    try {
      const original = await this.constructor.findById(this._id).lean();
      if (original && original.bookingStatus) {
        prevStatus = original.bookingStatus;
      }
    } catch (err) {
      console.error("Failed to fetch previous booking status:", err.message);
    }

    const newStatus = this.bookingStatus;
    const message = `Booking ${this.bookingCode}: status has been updated from '${prevStatus}' to '${newStatus}'`;

    try {
      await createAlert({
        bookingId: this._id,
        customerId: this.customerId,
        vehicleId: this.vehicleId,
        message
      });
    } catch (err) {
      console.error("Failed to create alert:", err.message);
    }
  }
  next();
});



module.exports = mongoose.model("Booking", bookingSchema);