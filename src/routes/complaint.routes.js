const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require('../middlewares/uploadMiddleware');

// ✅ All routes require authentication
router.use(authMiddleware);

// ✅ Customer: Create complaint (with images)
router.post(
  '/',
  roleMiddleware("customer"),
  (req, res, next) => { req.uploadType = "complaint"; next(); },
  upload.array('images', 5),
  ComplaintController.createComplaint
);

// ✅ Customer: Update complaint (with images)
router.put(
  '/:id',
  roleMiddleware("customer"),
  (req, res, next) => { req.uploadType = "complaint"; next(); },
  upload.array('images', 5),
  ComplaintController.editComplaint
);

// ✅ Customer: Delete complaint
router.delete(
  '/:id',
  roleMiddleware("customer"),
  ComplaintController.deleteComplaint
);

// ✅ Customer: View own complaints
router.get(
  '/my-complaints',
  roleMiddleware("customer"),
  ComplaintController.getMyComplaints
);

// ✅ Customer: Pagination
router.get(
  '/my-complaints/paginated',
  roleMiddleware("customer"),
  ComplaintController.getMyComplaintsPaginated
);

// ✅ View complaint by ID (customer sees only their own)
router.get(
  '/:id',
  roleMiddleware("admin", "customer"),
  ComplaintController.getComplaintById
);

// ✅ Admin: Filtering
router.get(
  '/status/:status',
  roleMiddleware("admin"),
  ComplaintController.getComplaintsByStatus
);

// ✅ Admin: Pagination
router.get(
  '/paginated',
  roleMiddleware("admin"),
  ComplaintController.getAllComplaintsPaginated
);

// ✅ Admin: Pagination + Filtering
router.get(
  '/status/:status/paginated',
  roleMiddleware("admin"),
  ComplaintController.getComplaintsByStatusPaginated
);

// ✅ Admin: Update status
router.patch(
  '/:id/status',
  roleMiddleware("admin"),
  ComplaintController.updateComplaintStatus
);

// ✅ Admin: Get all
router.get(
  '/',
  roleMiddleware("admin"),
  ComplaintController.getAllComplaints
);

module.exports = router;
