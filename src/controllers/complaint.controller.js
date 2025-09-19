const ComplaintService = require('../services/complaint.service');
const { COMPLAINT_STATUS } = require('../config/complaint');
const Complaint = require('../models/complaint.model');

class ComplaintController {

  // Create a new complaint
  static async createComplaint(req, res) {
    try {
      const complaintData = {
        ...req.body,
        user: req.user._id,
        images: req.files ? req.files.map(file => file.path) : []
      };

      const complaint = await ComplaintService.createComplaint(complaintData);
      res.status(201).json(complaint);
    } catch (error) {
      res.status(400).json({ error: error.message });
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
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json(complaint);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edit complaint
  static async editComplaint(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      if (req.files && req.files.length > 0) {
        const validation = ComplaintService.validateImages(req.files);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.message });
        }
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description,
        images: req.files && req.files.length > 0 ? req.files.map(file => file.path) : undefined
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
      if (!Object.values(COMPLAINT_STATUS).includes(status)) {
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

      if (!Object.values(COMPLAINT_STATUS).includes(status)) {
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
}


ComplaintService.getComplaintById = async function(id) {
  try {
    return await Complaint.findById(id).populate('user', 'firstname email');
  } catch (error) {
    throw new Error(`Error fetching complaint: ${error.message}`);
  }
};

module.exports = ComplaintController;