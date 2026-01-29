// controllers/complaint.controller.js
const ComplaintService = require('../services/complaint.service');

const VALID_STATUSES = ['pending', 'processing', 'rejected', 'resolved'];

class ComplaintController {

static async createComplaint(req, res) {
  try {
    const images = req.files?.map(file => {
      // store relative path to serve later
      return `/uploads/images/complaints/${file.filename}`;
    }) || [];

    const complaintData = {
      ...req.body,
      user: req.user._id,
      images // ← store uploaded images
    };

    const complaint = await ComplaintService.createComplaint(complaintData);
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(400).json({ error: error.message });
  }
}

  static async getMyComplaints(req, res) {
    try {
      const userId = req.user._id;
      const complaints = await ComplaintService.getComplaintsByUser(userId);
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllComplaints(req, res) {po
    try {
      const complaints = await ComplaintService.getAllComplaints();
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getComplaintById(req, res) {
    try {
      const { id } = req.params;
      const complaint = await ComplaintService.getComplaintById(id);
      res.json(complaint);
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // ✅ Edit Complaint + New Image Upload Support
  static async editComplaint(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const newImages = req.files?.map(file =>
        `/uploads/images/complaints/${file.filename}`
      ) || [];

      const updateData = {
        title: req.body.title,
        description: req.body.description
      };

      if (newImages.length > 0) updateData.images = newImages;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const updatedComplaint = await ComplaintService.editComplaint(id, userId, updateData);
      res.json(updatedComplaint);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Only pending')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('only edit your own')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  static async getComplaintsByStatus(req, res) {
    try {
      const { status } = req.params;
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const complaints = await ComplaintService.getComplaintsByStatus(status);
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateComplaintStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const complaint = await ComplaintService.updateComplaintStatus(id, status);
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      res.json(complaint);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteComplaint(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Complaint ID is required' });
      }
      const deletedComplaint = await ComplaintService.deleteComplaint(id);
      if (!deletedComplaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Complaint deleted successfully',
        data: deletedComplaint
      });
    } catch (error) {
      console.error('Error in deleteComplaint controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // ✅ Paginated
  static async getMyComplaintsPaginated(req, res) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const complaints = await ComplaintService.getComplaintsByUserPaginated(userId, page, limit);

      res.json({
        success: true,
        message: "Your complaints (paginated) fetched",
        complaints
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get paginated complaints for admin
  static async getAllComplaintsPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const complaints = await ComplaintService.getAllComplaintsPaginated(page, limit);

      res.json({
        success: true,
        message: "All complaints (paginated) fetched",
        complaints
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get paginated complaints by status for admin
  static async getComplaintsByStatusPaginated(req, res) {
    try {
      const { status } = req.params;
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const complaints = await ComplaintService.getComplaintsByStatusPaginated(status, page, limit);

      res.json({
        success: true,
        message: `Complaints with status "${status}" (paginated) fetched`,
        complaints
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ComplaintController;
