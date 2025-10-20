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
router.get('/:id', roleMiddleware(["admin", "customer"]), ComplaintController.getComplaintById);
router.patch('/:id/status', roleMiddleware("admin"), ComplaintController.updateComplaintStatus);
router.get('/', roleMiddleware("admin"), ComplaintController.getAllComplaints);
router.delete('/:id', roleMiddleware("customer"), ComplaintController.deleteComplaint);

module.exports = router;