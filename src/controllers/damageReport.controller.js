// controllers/damageReport.controller.js
const DamageReportService = require('../services/damageReport.service');
const paginate = require("../utils/paginate");
const DamageReport = require("../models/damageReport.model");
const Vehicle = require("../models/vehicle.model");


class DamageReportController {

  // Customer creates a damage report
  static async createDamageReport(req, res) {
    try {
      const { bookingId, description , damageType } = req.body;
      const customerId = req.user._id; // from auth middleware

      if (!bookingId || !description || !damageType) {
        return res.status(400).json({ error: 'Booking ID and description are required' });
      }

      const reportData = { bookingId, description, customerId,damageType };
      const report = await DamageReportService.createDamageReport(reportData, req.files);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all reports (admin)
  static async getAllReports(req, res) {
    try {
      const reports = await DamageReportService.getAllDamageReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
 // Add this method
static async getOwnerDamageReports(req, res) {
  try {
    const ownerId = req.user._id; // owner is logged in
    const reports = await DamageReportService.getDamageReportsByOwner(ownerId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
  // Add this method to DamageReportController

static async updateDamageReport(req, res) {
  try {
    const { id } = req.params;
    const customerId = req.user._id;
    const { description, damageType } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (damageType !== undefined) updateData.damageType = damageType;

    // Optional: support removing images via query or body flag
    // e.g., if (req.body.removeImages) updateData.removeImages = true;

    const report = await DamageReportService.updateDamageReport(
      id,
      customerId,
      updateData,
      req.files
    );

    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

  // Get customer's own reports
  static async getMyReports(req, res) {
    try {
      const reports = await DamageReportService.getReportsByCustomer(req.user._id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin/Owner updates report status
  static async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const report = await DamageReportService.updateReportStatus(id, status);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Optional: Delete report (e.g., within 1 hour of creation)
  static async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const report = await DamageReportService.deleteReport(id, req.user._id);
      res.json({ message: 'Report deleted', report });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

// ---------------- PAGINATED METHODS ----------------

  // ✅ 1️⃣ Customer - Paginated reports
  static async getMyReportsPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const filter = { customerId: req.user._id };

      const populateOptions = [
        { path: "customerId", select: "firstName lastName phoneNumber" },
        { path: "vehicleId", select: "title" },
        { path: "bookingId", select: "bookingStartDate bookingEndDate" },
      ];

      const result = await paginate(DamageReport, page, limit, filter, populateOptions);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ 2️⃣ Owner - Paginated reports
  static async getOwnerReportsPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      const vehicles = await Vehicle.find({ ownerId: req.user._id }, "_id");
      const vehicleIds = vehicles.map((v) => v._id);
      const filter = { vehicleId: { $in: vehicleIds } };

      const populateOptions = [
        { path: "customerId", select: "firstName lastName email phoneNumber" },
        { path: "vehicleId", select: "title" },
        { path: "bookingId", select: "bookingStartDate bookingEndDate" },
      ];

      const result = await paginate(DamageReport, page, limit, filter, populateOptions);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ 3️⃣ Admin - Paginated all reports
  static async getAllReportsPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const populateOptions = [
        { path: "customerId", select: "firstName lastName phoneNumber" },
        { path: "vehicleId", select: "title" },
        { path: "bookingId", select: "bookingStartDate bookingEndDate" },
      ];

      const result = await paginate(DamageReport, page, limit, {}, populateOptions);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }}
module.exports = DamageReportController;