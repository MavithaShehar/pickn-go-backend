const mongoose = require("mongoose");

const rentDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  documentType: { type: String, default: "license", required: true },
  documentVerifiedStatus: { type: Boolean, default: false },
  documents: {
    license: { type: Buffer }, // store file as binary
    licenseType: { type: String }, // store MIME type
  },
}, { timestamps: true });

module.exports = mongoose.model("RentDocument", rentDocumentSchema);
