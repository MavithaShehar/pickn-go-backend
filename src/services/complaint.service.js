const Complaint = require('../models/complaint.model');
const { COMPLAINT_STATUS } = require('../config/complaint');
const fs = require('fs').promises; // Use promise-based fs
const path = require('path');
const generateComplaintId = require('../utils/generateComplaintId');

class ComplaintService {

  // Validate uploaded images
  static validateImages(files) {
    if (files.length > 5) {
      return { valid: false, message: 'Maximum 5 images allowed' };
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    for (let file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return { valid: false, message: 'Only JPEG, PNG images are allowed' };
      }
    }

    return { valid: true, message: 'Images are valid' };
  }

  // Create new complaint
  static async createComplaint(complaintData) {
    try {
      const complaintID = await generateComplaintId();
      const complaint = new Complaint({
        ...complaintData,
        complaintID // Correctly assign inside object
      });
      return await complaint.save();
    } catch (error) {
      throw new Error(`Error creating complaint: ${error.message}`);
    }
  }

  // Get all complaints
  static async getAllComplaints() {
    try {
      return await Complaint.find()
        .populate('user', 'firstname email') // Assuming User has 'firstname'
        .sort({ dateCreated: -1 });
    } catch (error) {
      throw new Error(`Error fetching complaints: ${error.message}`);
    }
  }

   // ✅ GET COMPLAINT BY ID — NOW INSIDE CLASS
  static async getComplaintById(id) {
    try {
      const complaint = await Complaint.findById(id).populate('user', 'firstname email');
      if (!complaint) {
        throw new Error('Complaint not found');
      }
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

  // Edit complaint (only owner + pending)
  static async editComplaint(complaintId, userId, updateData) {
    try {
      const complaint = await Complaint.findById(complaintId);
      
      if (!complaint) {
        throw new Error('Complaint not found');
      }

      if (complaint.user.toString() !== userId.toString()) {
        throw new Error('You can only edit your own complaints');
      }

      if (complaint.status !== COMPLAINT_STATUS.PENDING) {
        throw new Error('Only pending complaints can be edited');
      }

      // Delete old images if new ones are uploaded
      if (updateData.images && complaint.images && complaint.images.length > 0) {
        const deletePromises = complaint.images.map(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          return fs.unlink(fullPath).catch(err => {
            console.log('Error deleting old image:', err.message);
          });
        });
        await Promise.all(deletePromises);
      }

      const updatedComplaint = await Complaint.findByIdAndUpdate(
        complaintId,
        {
          title: updateData.title || complaint.title,
          description: updateData.description || complaint.description,
          images: updateData.images || complaint.images,
          lastModified: Date.now()
        },
        { new: true, runValidators: true }
      ).populate('user', 'firstname email');

      return updatedComplaint;
    } catch (error) {
      throw new Error(`Error editing complaint: ${error.message}`);
    }
  }

  // Update complaint status (admin or moderator use)
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
   // Delete complaint by ID
  static async deleteComplaint(id) {
    try {
      const complaint = await Complaint.findByIdAndDelete(id);

      if (!complaint) {
        return null; // Not found
      }

      return complaint;
    } catch (error) {
      throw new Error(`Failed to delete complaint: ${error.message}`);
    }
  }

}

module.exports = ComplaintService;