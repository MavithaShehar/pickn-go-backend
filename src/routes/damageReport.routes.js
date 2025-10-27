// routes/damageReport.routes.js
const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const DamageReportController = require('../controllers/damgeReport.controller');

// Customer routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('customer'),
  uploadMiddleware.uploadArray('images', 5),
  DamageReportController.createDamageReport
);



router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('customer'),
  uploadMiddleware.uploadArray('images', 5),
  DamageReportController.updateDamageReport
);
// ✅ New - Customer paginated route
router.get(
  "/my/paginated",
  authMiddleware,
  roleMiddleware("customer"),
  DamageReportController.getMyReportsPaginated
);
router.get('/my', authMiddleware,roleMiddleware( 'customer'), DamageReportController.getMyReports);
router.delete('/:id', authMiddleware,roleMiddleware( 'customer'), DamageReportController.deleteReport);

// Admin/Owner routes
router.get('/', authMiddleware, roleMiddleware('admin'), DamageReportController.getAllReports);
// ✅ New - Owner paginated route
router.get(
  "/owner/paginated",
  authMiddleware,
  roleMiddleware("owner"),
  DamageReportController.getOwnerReportsPaginated
);
// ✅ New - Admin paginated route
router.get(
  "/admin/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  DamageReportController.getAllReportsPaginated
);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), DamageReportController.updateReportStatus);
router.get(
  '/owner',
  authMiddleware,
  roleMiddleware('owner'),
  DamageReportController.getOwnerDamageReports 
);


module.exports = router;