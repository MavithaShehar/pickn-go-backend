const RentDocument = require("../models/rentDocument.model");
const Booking = require("../models/booking.model");

// ================================
// Upload License (Customer)
// ================================
exports.uploadLicenseToMongo = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id; // from auth middleware

    if (!req.file)
      return res.status(400).json({ message: "License file is required" });

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Upload license in RentDocument
    const filter = { userId, bookingId, documentType: "license" };
    const update = {
      documents: {
        license: req.file.buffer,
        licenseType: req.file.mimetype,
        status: "pending", // initial status
      },
      documentVerifiedStatus: false,
      verifiedBy: null,
      verifiedAt: null,
    };
    const options = { new: true, upsert: true };

    const document = await RentDocument.findOneAndUpdate(filter, update, options);

    res.status(200).json({
      message: "License uploaded successfully to MongoDB",
      documentId: document._id,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// View License (Owner Only)
// ================================
exports.viewLicenseByOwner = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("vehicleId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the owner of the vehicle can view
    if (String(booking.vehicleId.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied: Not the owner" });
    }

    const document = await RentDocument.findOne({ bookingId, documentType: "license" });
    if (!document) return res.status(404).json({ message: "License not uploaded" });

    res.status(200).json({
      message: "License retrieved successfully",
      license: {
        type: document.documents.licenseType,
        data: document.documents.license.toString("base64"), // send as base64
        status: document.documents.status,
      },
      verification: {
        verified: document.documentVerifiedStatus,
        verifiedBy: document.verifiedBy,
        verifiedAt: document.verifiedAt,
      },
    });
  } catch (err) {
    console.error("View License Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Verify License (Owner Only)
// ================================
exports.verifyLicenseByOwner = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // "verified" or "rejected"

    const booking = await Booking.findById(bookingId).populate("vehicleId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the owner of the vehicle can verify
    if (String(booking.vehicleId.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied: Not the owner" });
    }

    // Build update fields
    const update = {
      "documents.status": status,
      documentVerifiedStatus: status === "verified",
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    };

    // Update license verification status
    const document = await RentDocument.findOneAndUpdate(
      { bookingId, documentType: "license" },
      update,
      { new: true }
    );

    if (!document) return res.status(404).json({ message: "License not uploaded" });

    res.status(200).json({
      message: `License ${status} successfully`,
      documentId: document._id,
      status: document.documents.status,
      documentVerifiedStatus: document.documentVerifiedStatus,
      verifiedBy: document.verifiedBy,
      verifiedAt: document.verifiedAt,
    });
  } catch (err) {
    console.error("Verify License Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
