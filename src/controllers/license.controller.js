const RentDocument = require("../models/rentDocument.model");

// ================================
// Upload License (Customer)
// ================================
exports.uploadLicenseToMongo = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    if (!req.file)
      return res.status(400).json({ message: "License file is required" });

    // Upload or update license
    const filter = { userId, documentType: "license" };
    const update = {
      documents: {
        license: req.file.buffer,
        licenseType: req.file.mimetype,
        status: "pending",
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
    const { userId } = req.params; // Customer userId provided in URL

    const document = await RentDocument.findOne({ userId, documentType: "license" });
    if (!document) return res.status(404).json({ message: "License not uploaded" });

    res.status(200).json({
      message: "License retrieved successfully",
      license: {
        type: document.documents.licenseType,
        data: document.documents.license.toString("base64"),
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
    const { userId } = req.params; // Customer userId
    const { status } = req.body;   // "verified" or "rejected"

    const update = {
      "documents.status": status,
      documentVerifiedStatus: status === "verified",
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    };

    const document = await RentDocument.findOneAndUpdate(
      { userId, documentType: "license" },
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
