const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create complaint with image upload
router.post('/',
  uploadMiddleware.upload.array('images', 5),
  uploadMiddleware.handleUploadErrors,
  ComplaintController.createComplaint
);

// Get complaints by status (specific)
router.get('/status/:status', ComplaintController.getComplaintsByStatus);

// Get complaint by ID (specific)
router.get('/:id', ComplaintController.getComplaintById);

// Update complaint status (PATCH)
router.patch('/:id/status', ComplaintController.updateComplaintStatus);

// Edit complaint with images (PUT)
router.put('/:id',uploadMiddleware.upload.array('images', 5),uploadMiddleware.handleUploadErrors,ComplaintController.editComplaint
);

// Get complaint by ID (specific)
router.get('/', ComplaintController.getAllComplaints);



module.exports = router;