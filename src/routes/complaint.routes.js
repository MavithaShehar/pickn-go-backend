const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const roleMiddleware = require("../middlewares/roleMiddleware");


// All routes require authentication
router.use(authMiddleware);

// Create complaint with image upload
router.post('/',roleMiddleware("customer"),
  uploadMiddleware.upload.array('images', 5),
  uploadMiddleware.handleUploadErrors,
  ComplaintController.createComplaint
);

// Get complaints by status (specific)
router.get('/status/:status', roleMiddleware("admin"),ComplaintController.getComplaintsByStatus);

// Get complaint by ID (specific)
router.get('/:id', roleMiddleware( "admin"), ComplaintController.getComplaintById);

router.get('/:id', roleMiddleware( "customer"), ComplaintController.getComplaintById);

// Update complaint status (PATCH)
router.patch('/:id/status',roleMiddleware("admin"), ComplaintController.updateComplaintStatus);

// Edit complaint with images (PUT)
router.put('/:id',roleMiddleware("customer"),uploadMiddleware.upload.array('images', 5),uploadMiddleware.handleUploadErrors,ComplaintController.editComplaint
);

// Get all complaints (admin only)
router.get('/',roleMiddleware("admin"), ComplaintController.getAllComplaints);

//  DELETE complaint --— customer only
router.delete('/:id', roleMiddleware("customer"), ComplaintController.deleteComplaint);



module.exports = router;