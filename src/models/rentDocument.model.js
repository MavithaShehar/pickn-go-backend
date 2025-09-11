const mongoose = require("mongoose");

const rentDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  documentType: { type: String, required: true },
  documentUrl: { type: String, required: true },
  verifiedStatus: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("RentDocument", rentDocumentSchema);