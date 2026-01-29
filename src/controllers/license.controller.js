const RentDocument = require("../models/rentDocument.model");

// Helper to generate relative URL
const generateFileUrl = (fileName) => {
  if (!fileName) return null;
  return `/uploads/images/licenses/${fileName}`;
};

// ================================
// Upload License (Customer, Owner)
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
        front: front.filename,
        back: back.filename,
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
      frontUrl: generateFileUrl(document.documents.front),
      backUrl: generateFileUrl(document.documents.back),
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Update License (Customer, Owner)
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
        front: front.filename,
        back: back.filename,
        status: "pending",
      },
      documentVerifiedStatus: false,
      verifiedBy: null,
      verifiedAt: null,
    };

    const document = await RentDocument.findOneAndUpdate(filter, update, { new: true });

    if (!document) return res.status(404).json({ message: "License not found" });

    res.status(200).json({
      message: "License updated successfully",
      documentId: document._id,
      frontUrl: generateFileUrl(document.documents.front),
      backUrl: generateFileUrl(document.documents.back),
    });
  } catch (err) {
    console.error("Update License Error (Customer/Owner):", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Verify / Update License (Admin)
// ================================
exports.updateLicenseOwner = async (req, res) => {
  try {
    const { userId } = req.params;
    const { expireDate, status } = req.body;

    const filter = { userId, documentType: "license" };
    const update = {};

    if (expireDate) update.expireDate = expireDate;
    if (status) {
      update["documents.status"] = status;
      update.documentVerifiedStatus = status === "verified";
      update.verifiedBy = req.user.id;
      update.verifiedAt = new Date();
    }

    const document = await RentDocument.findOneAndUpdate(filter, update, { new: true });
    if (!document) return res.status(404).json({ message: "License not found" });

    res.status(200).json({
      message: "License verified/updated successfully",
      documentId: document._id,
      expireDate: document.expireDate,
      status: document.documents?.status,
      verified: document.documentVerifiedStatus,
      frontUrl: generateFileUrl(document.documents.front),
      backUrl: generateFileUrl(document.documents.back),
    });
  } catch (err) {
    console.error("Update License Error (Admin):", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// View License (Customer, Owner, Admin)
// ================================
exports.viewLicense = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { userId } = req.params;

    let document;
    if (req.user.role === "admin") {
      if (!userId) return res.status(400).json({ message: "Customer userId is required" });
      document = await RentDocument.findOne({ userId, documentType: "license" });
    } else {
      document = await RentDocument.findOne({ userId: requesterId, documentType: "license" });
    }

    if (!document) return res.status(404).json({ message: "License not uploaded" });

    const doc = document.documents || {};

    res.status(200).json({
      message: "License retrieved successfully",
      license: {
        frontUrl: generateFileUrl(doc.front),
        backUrl: generateFileUrl(doc.back),
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
// Delete License (Customer, Owner, Admin)
// ================================
exports.deleteLicense = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { userId } = req.params;

    let filter;
    if (req.user.role === "admin") {
      if (!userId) return res.status(400).json({ message: "Customer userId is required" });
      filter = { userId, documentType: "license" };
    } else {
      filter = { userId: requesterId, documentType: "license" };
    }

    const document = await RentDocument.findOneAndDelete(filter);
    if (!document) return res.status(404).json({ message: "License not found" });

    res.status(200).json({ message: "License deleted successfully" });
  } catch (err) {
    console.error("Delete License Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// View All Licenses (Admin)
// ================================
exports.viewAllLicenses = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const documents = await RentDocument.find({ documentType: "license" })
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 });

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "No license documents found" });
    }

    const formattedDocs = documents.map((doc) => ({
      documentId: doc._id,
      userId: doc.userId?._id,
      userName: doc.userId?.fullName || "N/A",
      email: doc.userId?.email || "N/A",
      role: doc.userId?.role || "N/A",
      expireDate: doc.expireDate,
      status: doc.documents?.status || "pending",
      verified: doc.documentVerifiedStatus,
      verifiedBy: doc.verifiedBy,
      verifiedAt: doc.verifiedAt,
      frontUrl: generateFileUrl(doc.documents.front),
      backUrl: generateFileUrl(doc.documents.back),
      createdAt: doc.createdAt,
    }));

    res.status(200).json({
      message: "All license documents retrieved successfully",
      count: formattedDocs.length,
      licenses: formattedDocs,
    });
  } catch (err) {
    console.error("View All Licenses Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// View All Licenses (Admin) - Paginated
// ================================
exports.viewAllLicensesPaginated = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const { page = 1, limit = 5 } = req.query;
    const paginate = require("../utils/paginate");

    const filter = { documentType: "license" };
    const populateOptions = { path: "userId", select: "fullName email role" };

    const result = await paginate(RentDocument, parseInt(page), parseInt(limit), filter, populateOptions);

    const formattedDocs = result.data.map((doc) => ({
      documentId: doc._id,
      userId: doc.userId?._id,
      userName: doc.userId?.fullName || "N/A",
      email: doc.userId?.email || "N/A",
      role: doc.userId?.role || "N/A",
      expireDate: doc.expireDate,
      status: doc.documents?.status || "pending",
      verified: doc.documentVerifiedStatus,
      verifiedBy: doc.verifiedBy,
      verifiedAt: doc.verifiedAt,
      frontUrl: generateFileUrl(doc.documents.front),
      backUrl: generateFileUrl(doc.documents.back),
      createdAt: doc.createdAt,
    }));

    res.status(200).json({
      message: "Paginated license documents retrieved successfully",
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalDocuments: result.totalDocuments,
      licenses: formattedDocs,
    });
  } catch (err) {
    console.error("Paginated View All Licenses Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
