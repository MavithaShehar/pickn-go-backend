// services/damageReport.service.js
const DamageReport = require('../models/damageReport.model');
const Booking = require('../models/booking.model');
const Vehicle = require('../models/vehicle.model'); 
const fs = require('fs').promises;
const path = require('path');
const user=require('../models/user.model');

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
      const customer = await user.findById(reportData.customerId, 'phoneNumber');
     if (!customer || !customer.phoneNumber) {
       throw new Error('Customer phone number not found');
     }

      // 3. Create report
      const report = new DamageReport({
        ...reportData,
        customerId: reportData.customerId,
        phoneNumber: customer.phoneNumber,
        vehicleId: booking.vehicleId,
        images: files ? files.map(f => f.path) : []
      });

      await report.save({ session });
      await session.commitTransaction();
      session.endSession();

      // Populate relations for response
      return await DamageReport.findById(report._id)
        .populate('customerId', 'firstName lastName email phoneNumber')
        .populate('vehicleId', 'title')
        .populate('bookingId', 'bookingStartDate bookingEndDate');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Failed to create damage report: ${error.message}`);
    }
  }

  // Add this method inside the DamageReportService class

static async updateDamageReport(reportId, customerId, updateData, files) {
  const session = await DamageReport.startSession();
  session.startTransaction();

  try {
    // Find report and ensure it belongs to the customer and is editable
    const report = await DamageReport.findOne({ _id: reportId, customerId }).session(session);
    if (!report) {
      throw new Error('Report not found or unauthorized');
    }

    // Only allow editing if status is "Pending Review"
    if (report.status !== 'Pending Review') {
      throw new Error('Cannot edit report after review has started');
    }

    // Validate damageType if provided
    if (updateData.damageType) {
      if (!DamageReport.DAMAGE_TYPES.includes(updateData.damageType.toLowerCase())) {
        throw new Error('Invalid damage type');
      }
      updateData.damageType = updateData.damageType.toLowerCase();
    }

    // Validate description if provided
    if (updateData.description !== undefined) {
      if (!updateData.description.trim()) {
        throw new Error('Description cannot be empty');
      }
      if (updateData.description.length > 1000) {
        throw new Error('Description must be at most 1000 characters');
      }
    }

    // Handle images
    let imagePaths = report.images; // keep existing if no new files
    if (files && files.length > 0) {
      const validation = this.validateImages(files);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      // Optional: delete old images from disk (see note below)
      imagePaths = files.map(f => f.path);
    } else if (updateData.removeImages === true) {
      // Optional: allow explicit image removal
      imagePaths = [];
    }

    // Update the report
    const updatedReport = await DamageReport.findByIdAndUpdate(
      reportId,
      {
        ...updateData,
        images: imagePaths,
        // Do NOT allow changing bookingId, vehicleId, etc.
      },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return await DamageReport.findById(updatedReport._id)
      .populate('customerId', 'firstName lastName email phoneNumber ')
      .populate('vehicleId', 'title')
      .populate('bookingId', 'bookingStartDate bookingEndDate');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to update damage report: ${error.message}`);
  }
}

  // Get all reports (admin view)
  static async getAllDamageReports() {
    return await DamageReport.find()
      .populate('customerId', 'firstName lastName phoneNumber ')
      .populate('vehicleId', 'title')
      .populate('bookingId', 'bookingStartDate bookingEndDate')
      .sort({ dateReported: -1 });
  }

  // ✅ Get damage reports for vehicles owned by a specific owner (User ID)
  static async getDamageReportsByOwner(ownerId) {
    // Step 1: Get all vehicles owned by this user
    const vehicles = await Vehicle.find({ ownerId }, '_id');
    const vehicleIds = vehicles.map(v => v._id);

    if (vehicleIds.length === 0) {
      return [];
    }

    // Step 2: Get damage reports for those vehicles
    return await DamageReport.find({ vehicleId: { $in: vehicleIds } })
      .populate('customerId', 'firstName lastName email phoneNumber')
      .populate('vehicleId', 'title')
      .populate('bookingId', 'bookingStartDate bookingEndDate')
      .sort({ dateReported: -1 });
  }


  // Get reports by customer
  static async getReportsByCustomer(customerId) {
    return await DamageReport.find({ customerId })
      .populate('customerId', 'firstName lastName phoneNumber')
      .populate('vehicleId', 'title')
      .populate('bookingId', 'bookingStartDate bookingEndDate')
      .sort({ dateReported: -1 });
  }

  // Update report status (admin only)
  static async updateReportStatus(reportId, status) {
    const validStatuses = ['Pending Review', 'Under Investigation', 'Awaiting Quote', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const report = await DamageReport.findByIdAndUpdate(
      reportId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'firstName lastName email phoneNumber')
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