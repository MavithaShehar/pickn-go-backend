// controllers/damageReport.controller.js
const DamageReportService = require('../services/damageReport.service');

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

  // Get all reports (admin/owner)
  static async getAllReports(req, res) {
    try {
      const reports = await DamageReportService.getAllDamageReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
}

module.exports = DamageReportController;