// routes/complaint.routes.js
const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require("../middlewares/roleMiddleware");
const { uploadArray, handleUploadErrors, convertFilesToBase64 } = require('../middlewares/uploadMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create complaint: accept up to 5 image files via form-data
router.post(
  '/',
  roleMiddleware("customer"),
  uploadArray('images', 5),
  handleUploadErrors,
  convertFilesToBase64,
  ComplaintController.createComplaint
);

// Edit complaint: also accept image uploads
router.put(
  '/:id',
  roleMiddleware("customer"),
  uploadArray('images', 5),
  handleUploadErrors,
  convertFilesToBase64,
  ComplaintController.editComplaint
);

// Other routes (no file upload needed)
router.get('/my-complaints', roleMiddleware("customer"), ComplaintController.getMyComplaints);
router.get('/status/:status', roleMiddleware("admin"), ComplaintController.getComplaintsByStatus);



router.patch('/:id/status', roleMiddleware("admin"), ComplaintController.updateComplaintStatus);
// Admin paginated complaints
router.get('/paginated', roleMiddleware("admin"), ComplaintController.getAllComplaintsPaginated);
// Admin paginated complaints by status
router.get('/status/:status/paginated', roleMiddleware("admin"), ComplaintController.getComplaintsByStatusPaginated);

router.get('/:id', roleMiddleware("admin", "customer"), ComplaintController.getComplaintById);
router.get('/', roleMiddleware("admin"), ComplaintController.getAllComplaints);
router.delete('/:id', roleMiddleware("customer"), ComplaintController.deleteComplaint);

// routes/complaint.routes.js

// Customer paginated complaints
router.get('/my-complaints/paginated', roleMiddleware("customer"), ComplaintController.getMyComplaintsPaginated);



module.exports = router;