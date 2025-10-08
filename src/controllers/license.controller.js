const RentDocument = require("../models/rentDocument.model");

// ================================
// Upload License (Customer)
// ================================
exports.uploadLicenseToMongo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { expireDate } = req.body;

    const front = req.files.frontImage?.[0];
    const back = req.files.backImage?.[0];

    if (!front || !back) {
      return res.status(400).json({ message: "Front and back images are required" });
    }

    const filter = { userId, documentType: "license" };
    const update = {
      expireDate,
      documents: {
        front: front.buffer,
        frontType: front.mimetype,
        back: back.buffer,
        backType: back.mimetype,
        status: "pending",
      },
      documentVerifiedStatus: false,
      verifiedBy: null,
      verifiedAt: null,
    };
    const options = { new: true, upsert: true };

    const document = await RentDocument.findOneAndUpdate(filter, update, options);

    res.status(200).json({
      message: "License uploaded successfully",
      documentId: document._id,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Update License (Customer)
// ================================
exports.updateLicenseCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { expireDate } = req.body;

    const front = req.files.frontImage?.[0];
    const back = req.files.backImage?.[0];

    if (!front || !back) {
      return res.status(400).json({ message: "Front and back images are required" });
    }

    const filter = { userId, documentType: "license" };
    const update = {
      expireDate,
      documents: {
        front: front.buffer,
        frontType: front.mimetype,
        back: back.buffer,
        backType: back.mimetype,
        status: "pending", // reset status when customer updates
      },
      documentVerifiedStatus: false,
      verifiedBy: null,
      verifiedAt: null,
    };
    const options = { new: true };

    const document = await RentDocument.findOneAndUpdate(filter, update, options);

    if (!document) return res.status(404).json({ message: "License not found" });

    res.status(200).json({
      message: "License updated successfully",
      documentId: document._id,
    });
  } catch (err) {
    console.error("Update License Error (Customer):", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Update License (Owner)
// ================================
exports.updateLicenseOwner = async (req, res) => {
  try {
    const { userId } = req.params;
    const { expireDate, status } = req.body; // owner can update expiry and/or status

    const filter = { userId, documentType: "license" };
    const update = {};

    if (expireDate) update.expireDate = expireDate;
    if (status) {
      update["documents.status"] = status;
      update.documentVerifiedStatus = status === "verified";
      update.verifiedBy = req.user.id;
      update.verifiedAt = new Date();
    }

    const options = { new: true };

    const document = await RentDocument.findOneAndUpdate(filter, update, options);

    if (!document) return res.status(404).json({ message: "License not found" });

    res.status(200).json({
      message: "License updated successfully by owner",
      documentId: document._id,
      expireDate: document.expireDate,
      status: document.documents?.status,
      documentVerifiedStatus: document.documentVerifiedStatus,
    });
  } catch (err) {
    console.error("Update License Error (Owner):", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// View License (Owner or Customer)
// ================================
exports.viewLicense = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { userId } = req.params;

    let document;

    if (req.user.role === "owner") {
      if (!userId) return res.status(400).json({ message: "Customer userId is required" });
      document = await RentDocument.findOne({ userId, documentType: "license" });
    } else if (req.user.role === "customer") {
      document = await RentDocument.findOne({ userId: requesterId, documentType: "license" });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!document) return res.status(404).json({ message: "License not uploaded" });

    const doc = document.documents || {};

    res.status(200).json({
      message: "License retrieved successfully",
      license: {
        frontImage: doc.front ? doc.front.toString("base64") : null,
        frontType: doc.frontType || null,
        backImage: doc.back ? doc.back.toString("base64") : null,
        backType: doc.backType || null,
        status: doc.status || "pending",
        expireDate: document.expireDate || null,
      },
      verification: {
        verified: document.documentVerifiedStatus || false,
        verifiedBy: document.verifiedBy || null,
        verifiedAt: document.verifiedAt || null,
      },
    });
  } catch (err) {
    console.error("View License Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Delete License (Owner or Customer)
// ================================
exports.deleteLicense = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { userId } = req.params;

    let filter;

    if (req.user.role === "owner") {
      if (!userId) return res.status(400).json({ message: "Customer userId is required" });
      filter = { userId, documentType: "license" };
    } else if (req.user.role === "customer") {
      filter = { userId: requesterId, documentType: "license" };
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const document = await RentDocument.findOneAndDelete(filter);

    if (!document) return res.status(404).json({ message: "License not found" });

    res.status(200).json({ message: "License deleted successfully" });
  } catch (err) {
    console.error("Delete License Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
