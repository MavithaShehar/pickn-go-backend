// services/complaint.service.js
const Complaint = require('../models/complaint.model');

class ComplaintService {

  // ⭐ CHANGED: Validate Base64 images instead of multer files
  static validateImages(images) {
    // Check if images is an array
    if (!Array.isArray(images)) {
      return { valid: false, message: 'Images must be an array' };
    }

    // Check maximum number of images
    if (images.length > 5) {
      return { valid: false, message: 'Maximum 5 images allowed' };
    }

    // Validate Base64 format and image type
    const base64ImageRegex = /^data:image\/(jpeg|jpg|png);base64,/;
    
    for (let image of images) {
      // Check if image is a string
      if (typeof image !== 'string') {
        return { valid: false, message: 'Each image must be a Base64 string' };
      }

      // Check if image has correct Base64 format
      if (!base64ImageRegex.test(image)) {
        return { 
          valid: false, 
          message: 'Only JPEG, PNG images are allowed in Base64 format (data:image/jpeg;base64,... or data:image/png;base64,...)' 
        };
      }

      // Check Base64 string size (approximately 10MB limit per image)
      const sizeInBytes = (image.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB > 10) {
        return { valid: false, message: 'Each image must be less than 10MB' };
      }
    }

    return { valid: true, message: 'Images are valid' };
  }

  // ⭐ CHANGED: Create new complaint with Base64 validation
  static async createComplaint(complaintData) {
    try {
      // Validate images if provided
      if (complaintData.images && complaintData.images.length > 0) {
        const validation = this.validateImages(complaintData.images);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }

      // Create and save complaint
      const complaint = new Complaint(complaintData);
      return await complaint.save();
    } catch (error) {
      throw new Error(`Error creating complaint: ${error.message}`);
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

  // ⭐ CHANGED: Edit complaint - removed file deletion logic
  static async editComplaint(complaintId, userId, updateData) {
    try {
      // Find the complaint
      const complaint = await Complaint.findById(complaintId);

      if (!complaint) {
        throw new Error('Complaint not found');
      }

      // Check ownership
      if (complaint.user.toString() !== userId.toString()) {
        throw new Error('You can only edit your own complaints');
      }

      // Check status
      if (complaint.status !== 'pending') {
        throw new Error('Only pending complaints can be edited');
      }

      // ⭐ CHANGED: Validate new Base64 images if provided
      if (updateData.images && updateData.images.length > 0) {
        const validation = this.validateImages(updateData.images);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }

      // ⭐ REMOVED: No need to delete old image files from filesystem
      // With Base64, images are stored in database and automatically replaced

      // Update the complaint
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

  // ⭐ CHANGED: Delete complaint - removed file deletion logic
  static async deleteComplaint(id) {
    try {
      const complaint = await Complaint.findByIdAndDelete(id);

      if (!complaint) {
        return null;
      }

      // ⭐ REMOVED: No need to delete image files from filesystem
      // Base64 images are stored in database and automatically deleted with the document

      return complaint;
    } catch (error) {
      throw new Error(`Failed to delete complaint: ${error.message}`);
    }
  }
}

module.exports = ComplaintService;