const mongoose = require("mongoose");

const rentDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Default document type is 'license'
  documentType: { type: String, default: "license", required: true },

  documentverifiedStatus: { type: Boolean, default: false },

  // Default license field (path can be empty initially)
  documents: {
    license: { type: String, default: "" },
  }

}, { timestamps: true });

module.exports = mongoose.model("RentDocument", rentDocumentSchema);
