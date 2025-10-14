// controllers/complaint.controller.js
const ComplaintService = require('../services/complaint.service');
const Complaint = require('../models/complaint.model');

const VALID_STATUSES = ['pending', 'processing', 'rejected', 'resolved'];

class ComplaintController {

  // ⭐ CHANGED: Create a new complaint with Base64 images
  static async createComplaint(req, res) {
    try {
      const complaintData = {
        ...req.body,
        user: req.user._id,
        // ⭐ CHANGED: Get images from req.body instead of req.files
        images: req.body.images || []
      };

      const complaint = await ComplaintService.createComplaint(complaintData);
      res.status(201).json(complaint);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all complaints created by the current user (customer)
  static async getMyComplaints(req, res) {
    try {
      const userId = req.user._id;
      const complaints = await ComplaintService.getComplaintsByUser(userId);
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all complaints
  static async getAllComplaints(req, res) {
    try {
      const complaints = await ComplaintService.getAllComplaints();
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get complaint by ID
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

  // ⭐ CHANGED: Edit complaint with Base64 images
  static async editComplaint(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      // ⭐ CHANGED: Validate Base64 images from req.body
      if (req.body.images && req.body.images.length > 0) {
        const validation = ComplaintService.validateImages(req.body.images);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.message });
        }
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description,
        // ⭐ CHANGED: Get images from req.body
        images: req.body.images && req.body.images.length > 0 ? req.body.images : undefined
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
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

  // Get complaints by status
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

  // Update complaint status
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

  // DELETE: Delete a complaint by ID
  static async deleteComplaint(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Complaint ID is required'
        });
      }

      const deletedComplaint = await ComplaintService.deleteComplaint(id);

      if (!deletedComplaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
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
}

module.exports = ComplaintController;