const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require('../middlewares/uploadMiddleware'); // ✅ multer instance

// All routes require authentication
router.use(authMiddleware);

// ✅ Create complaint: accept up to 5 image files via form-data
router.post(
  '/',
  roleMiddleware("customer"),
  (req, res, next) => { req.uploadType = "complaint"; next(); },
  upload.array('images', 5),
  ComplaintController.createComplaint
);

// ✅ Edit complaint: also accept image uploads
router.put(
  '/:id',
  roleMiddleware("customer"),
  (req, res, next) => { req.uploadType = "complaint"; next(); },
  upload.array('images', 5),
  ComplaintController.editComplaint
);

// ✅ Customer routes
router.get('/my-complaints', roleMiddleware("customer"), ComplaintController.getMyComplaints);

// ✅ NEW: Customer paginated complaints (merged from branch)
router.get('/my-complaints/paginated', roleMiddleware("customer"), ComplaintController.getMyComplaintsPaginated);

// ✅ Admin routes
router.get('/status/:status', roleMiddleware("admin"), ComplaintController.getComplaintsByStatus);
router.get('/:id', roleMiddleware("admin", "customer"), ComplaintController.getComplaintById);
router.patch('/:id/status', roleMiddleware("admin"), ComplaintController.updateComplaintStatus);
router.get('/paginated', roleMiddleware("admin"), ComplaintController.getAllComplaintsPaginated);
router.get('/status/:status/paginated', roleMiddleware("admin"), ComplaintController.getComplaintsByStatusPaginated);
router.get('/', roleMiddleware("admin"), ComplaintController.getAllComplaints);

// ✅ Shared
router.get('/:id', roleMiddleware("admin", "customer"), ComplaintController.getComplaintById);

// ✅ Delete only customer-owned complaints
router.delete('/:id', roleMiddleware("customer"), ComplaintController.deleteComplaint);

module.exports = router;
