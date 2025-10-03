const mongoose = require("mongoose");

const rentDocumentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // customer
    documentType: { type: String, default: "license", required: true },

    // Verification fields
    documentVerifiedStatus: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },

    documents: {
      license: { type: Buffer, required: true }, // file binary
      licenseType: { type: String, required: true }, // MIME type
      status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RentDocument", rentDocumentSchema);
