// routes/damageReport.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware'); // ✅ multer instance
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const DamageReportController = require('../controllers/damageReport.controller');

// Customer routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('customer'),
  (req, res, next) => { req.uploadType = 'damageReports'; next(); }, // optional folder type
  upload.array('images', 5), // ✅ use multer array directly
  DamageReportController.createDamageReport
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('customer'),
  (req, res, next) => { req.uploadType = 'damageReports'; next(); },
  upload.array('images', 5),
  DamageReportController.updateDamageReport
);

router.get(
  "/my/paginated",
  authMiddleware,
  roleMiddleware("customer"),
  DamageReportController.getMyReportsPaginated
);

router.get('/my', authMiddleware,roleMiddleware( "customer","owner"), DamageReportController.getMyReports);
router.delete('/:id', authMiddleware,roleMiddleware( "customer","owner"), DamageReportController.deleteReport);

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
