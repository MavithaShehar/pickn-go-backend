const RentDocument = require("../models/rentDocument.model");
const Booking = require("../models/booking.model");

// Upload license to MongoDB
exports.uploadLicenseToMongo = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id; // from auth middleware

    if (!req.file) return res.status(400).json({ message: "License file is required" });

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Upload license in RentDocument
    const filter = { userId, bookingId, documentType: "license" };
    const update = {
      documents: {
        license: req.file.buffer,
        licenseType: req.file.mimetype,
      },
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
