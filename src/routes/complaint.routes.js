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

// Read
router.get('/', ComplaintController.getAllComplaints);
router.get('/:id', ComplaintController.getComplaintById);
router.get('/status/:status', ComplaintController.getComplaintsByStatus);

// Update
router.put('/:id',
  uploadMiddleware.upload.array('images', 5),
  uploadMiddleware.handleUploadErrors,
  ComplaintController.editComplaint
);

router.patch('/:id/status', ComplaintController.updateComplaintStatus);

module.exports = router;