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

bookingSchema.pre("save", function (next) {
  // store original document (only when not new)
  if (!this.isNew) {
    // Use toObject({ depopulate: true }) to avoid populated refs
    this._original = this.toObject({ depopulate: true });
  }
  // preserve new-flag for creation alert
  this._wasNew = this.isNew;
  next();
});

bookingSchema.post("save", async function (doc) {
  // creation alert (only for newly created docs)
  if (this._wasNew) {
    await createAlert({
      bookingId: doc._id,
      customerId: doc.customerId,
      message: `Booking ${doc.bookingCode || doc._id} created successfully.`,
    });
    return;
  }

  // If this was an update via save(), check status change
  if (this._original) {
    const oldStatus = this._original.bookingStatus;
    const newStatus = doc.bookingStatus;
    if (oldStatus !== newStatus) {
      await createAlert({
        bookingId: doc._id,
        customerId: doc.customerId,
        message: `Booking ${doc.bookingCode || doc._id} status changed from '${oldStatus}' to '${newStatus}'.`,
      });
    }
  }
});

// --- findOneAndUpdate-style detection (covers findByIdAndUpdate & findOneAndUpdate) ---
bookingSchema.pre("findOneAndUpdate", async function (next) {
  // store the old booking doc so we can compare after update
  this._oldBooking = await this.model.findOne(this.getQuery()).lean();
  next();
});

bookingSchema.post("findOneAndUpdate", async function (doc) {
  // If caller didn't return updated doc (no { new: true }), doc may be the pre-update doc.
  // We still can inspect the update object.
  const oldBooking = this._oldBooking;
  if (!oldBooking) return;

  const oldStatus = oldBooking.bookingStatus;

  // Extract new status from update object, or fallback to returned doc
  const update = this.getUpdate ? this.getUpdate() : {};
  const newStatus =
      (update && (update.bookingStatus ?? update.$set?.bookingStatus)) ??
      (doc && doc.bookingStatus);

  if (newStatus !== undefined && oldStatus !== newStatus) {
    // use the oldBooking._id (query) or doc._id (if returned)
    const bookingId = doc ? doc._id : oldBooking._id;
    const customerId = doc ? doc.customerId : oldBooking.customerId;
    const bookingCode = doc ? doc.bookingCode : oldBooking.bookingCode;

    await createAlert({
      bookingId,
      customerId,
      message: `Booking ${bookingCode || bookingId} status changed from '${oldStatus}' to '${newStatus}'.`,
    });
  }
});


module.exports = mongoose.model("Booking", bookingSchema);