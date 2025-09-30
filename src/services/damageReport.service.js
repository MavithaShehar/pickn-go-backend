// services/damageReport.service.js
const DamageReport = require('../models/damageReport.model');
const Booking = require('../models/booking.model');
const fs = require('fs').promises;
const path = require('path');

class DamageReportService {

  // Validate images (max 5, JPEG/PNG)
  static validateImages(files) {
    if (!files || files.length === 0) return { valid: true };
    if (files.length > 5) {
      return { valid: false, message: 'Maximum 5 images allowed' };
    }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    for (const file of files) {
      if (!allowed.includes(file.mimetype)) {
        return { valid: false, message: 'Only JPEG/PNG images allowed' };
      }
    }
    return { valid: true };
  }

  // Create damage report
  static async createDamageReport(reportData, files) {
    const session = await DamageReport.startSession();
    session.startTransaction();

    try {
      // 1. Validate booking exists and is "completed" or "confirmed"
      const booking = await Booking.findById(reportData.bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Optional: Only allow reports for completed/confirmed bookings
      if (!['confirmed', 'completed'].includes(booking.bookingStatus)) {
        throw new Error('Damage can only be reported for confirmed or completed bookings');
      }

      // 2. Validate images
      if (files && files.length > 0) {
        const validation = this.validateImages(files);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }

      // 3. Create report
      const report = new DamageReport({
        ...reportData,
        customerId: reportData.customerId,
        vehicleId: booking.vehicleId,
        images: files ? files.map(f => f.path) : []
      });

      await report.save({ session });
      await session.commitTransaction();
      session.endSession();

      // Populate relations for response
      return await DamageReport.findById(report._id)
        .populate('customerId', 'firstName lastName email')
        .populate('vehicleId', 'title')
        .populate('bookingId', 'bookingStartDate bookingEndDate');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Failed to create damage report: ${error.message}`);
    }
  }

  // Get all reports (admin/owner view)
  static async getAllDamageReports() {
    return await DamageReport.find()
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'title')
      .populate('bookingId', 'bookingStartDate bookingEndDate')
      .sort({ dateReported: -1 });
  }

  // Get reports by customer
  static async getReportsByCustomer(customerId) {
    return await DamageReport.find({ customerId })
      .populate('vehicleId', 'title')
      .populate('bookingId', 'bookingStartDate bookingEndDate')
      .sort({ dateReported: -1 });
  }

  // Update report status (admin/owner only)
  static async updateReportStatus(reportId, status) {
    const validStatuses = ['pending', 'reviewed', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const report = await DamageReport.findByIdAndUpdate(
      reportId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'firstName lastName email')
      .populate('vehicleId', 'title')
      .populate('bookingId', 'bookingStartDate bookingEndDate');

    if (!report) throw new Error('Damage report not found');
    return report;
  }

  // Delete report (optional, usually not allowed after creation)
  static async deleteReport(reportId, customerId) {
    const report = await DamageReport.findOneAndDelete({
      _id: reportId,
      customerId // Only allow customer to delete their own (optional)
    });
    if (!report) throw new Error('Report not found or unauthorized');
    return report;
  }
}

module.exports = DamageReportService;