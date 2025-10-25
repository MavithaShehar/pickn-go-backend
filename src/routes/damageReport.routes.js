// routes/damageReport.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware'); // ✅ multer instance
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const DamageReportController = require('../controllers/damgeReport.controller');

// Customer routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('customer'),
  (req, res, next) => { req.uploadType = 'damage'; next(); }, // optional folder type
  upload.array('images', 5), // ✅ use multer array directly
  DamageReportController.createDamageReport
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('customer'),
  (req, res, next) => { req.uploadType = 'damage'; next(); },
  upload.array('images', 5),
  DamageReportController.updateDamageReport
);

router.get('/my', authMiddleware, roleMiddleware('customer'), DamageReportController.getMyReports);
router.delete('/:id', authMiddleware, roleMiddleware('customer'), DamageReportController.deleteReport);

// Admin/Owner routes
router.get('/', authMiddleware, roleMiddleware('admin'), DamageReportController.getAllReports);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), DamageReportController.updateReportStatus);
router.get(
  '/owner',
  authMiddleware,
  roleMiddleware('owner'),
  DamageReportController.getOwnerDamageReports 
);

module.exports = router;
