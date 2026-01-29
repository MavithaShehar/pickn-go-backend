// services/complaint.service.js
const Complaint = require('../models/complaint.model');

class ComplaintService {

  // Create new complaint using uploaded files
// ✅ services/complaint.service.js
static async createComplaint(complaintData) {
  try {
    if (!complaintData.title || !complaintData.description) {
      throw new Error("Title & description required");
    }

    // ✅ Use images passed from controller already mapped from req.files
    const complaint = new Complaint({
      title: complaintData.title,
      description: complaintData.description,
      images: complaintData.images || [],  // << HERE ✅
      user: complaintData.user
    });

    await complaint.save();
    return complaint;
  } catch (err) {
    throw new Error("Error creating complaint: " + err.message);
  }
}


  // Get complaints by user ID
  static async getComplaintsByUser(userId) {
    try {
      return await Complaint.find({ user: userId })
        .populate('user', 'firstname email')
        .sort({ dateCreated: -1 });
    } catch (error) {
      throw new Error(`Error fetching your complaints: ${error.message}`);
    }
  }

  // Get all complaints
  static async getAllComplaints() {
    try {
      return await Complaint.find()
        .populate('user', 'firstname email')
        .sort({ dateCreated: -1 });
    } catch (error) {
      throw new Error(`Error fetching complaints: ${error.message}`);
    }
  }

  // Get complaint by ID
  static async getComplaintById(id) {
    try {
      const complaint = await Complaint.findById(id).populate('user', 'firstname email');
      if (!complaint) throw new Error('Complaint not found');
      return complaint;
    } catch (error) {
      throw new Error(`Error fetching complaint: ${error.message}`);
    }
  }

  // Get complaints by status
  static async getComplaintsByStatus(status) {
    try {
      return await Complaint.find({ status })
        .populate('user', 'firstname email')
        .sort({ dateCreated: -1 });
    } catch (error) {
      throw new Error(`Error fetching ${status} complaints: ${error.message}`);
    }
  }

  // Edit complaint with uploaded files
  static async editComplaint(complaintId, userId, updateData, files) {
    try {
      // Find the complaint
      const complaint = await Complaint.findById(complaintId);

      if (!complaint) throw new Error('Complaint not found');

      // Check ownership
      if (complaint.user.toString() !== userId.toString()) {
        throw new Error('You can only edit your own complaints');
      }

      // Check status
      if (complaint.status !== 'pending') {
        throw new Error('Only pending complaints can be edited');
      }

      // Use uploaded files instead of Base64
      if (files?.length) {
        updateData.images = files.map(file => `/uploads/images/complaints/${file.filename}`);
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      const updatedComplaint = await Complaint.findByIdAndUpdate(
        complaintId,
        { ...updateData, lastModified: Date.now() },
        { new: true, runValidators: true }
      ).populate('user', 'firstname email');

      return updatedComplaint;
    } catch (error) {
      throw new Error(`Error editing complaint: ${error.message}`);
    }
  }

  // Update complaint status
  static async updateComplaintStatus(complaintId, status) {
    try {
      return await Complaint.findByIdAndUpdate(
        complaintId,
        { status },
        { new: true, runValidators: true }
      ).populate('user', 'firstname email');
    } catch (error) {
      throw new Error(`Error updating complaint status: ${error.message}`);
    }
  }

  // Delete complaint
  static async deleteComplaint(id) {
    try {
      const complaint = await Complaint.findByIdAndDelete(id);
      return complaint || null;
    } catch (error) {
      throw new Error(`Failed to delete complaint: ${error.message}`);
    }
  }

  // Paginated queries
  static async getComplaintsByUserPaginated(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Complaint.find({ user: userId })
      .populate('user', 'firstname email')
      .sort({ dateCreated: -1 })
      .skip(skip)
      .limit(limit);
    return complaints;
  }

  static async getAllComplaintsPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Complaint.find()
      .populate('user', 'firstname email')
      .sort({ dateCreated: -1 })
      .skip(skip)
      .limit(limit);
    return complaints;
  }

  static async getComplaintsByStatusPaginated(status, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Complaint.find({ status })
      .populate('user', 'firstname email')
      .sort({ dateCreated: -1 })
      .skip(skip)
      .limit(limit);
  }
}

module.exports = ComplaintService;
