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
      front: { type: Buffer, required: true }, // front image
      back: { type: Buffer },                  // back image (optional)
      type: { type: String, required: true }, // MIME type
      status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    },

    expireDate: { type: Date }, // document expiration date
  },
  { timestamps: true }
);

// Ensure each user can have only one document type at a time
rentDocumentSchema.index({ userId: 1, documentType: 1 }, { unique: true });

module.exports = mongoose.model("RentDocument", rentDocumentSchema);
