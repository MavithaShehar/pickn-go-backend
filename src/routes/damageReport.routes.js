// routes/damageReport.routes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const DamageReportController = require('../controllers/damgeReport.controller');

// Customer routes
router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),roleMiddleware('customer'),
  DamageReportController.createDamageReport
);



router.patch(
  '/:id',
  authMiddleware,
  upload.array('images', 5),roleMiddleware('customer'),
  DamageReportController.updateDamageReport
);

router.get('/my', authMiddleware,roleMiddleware( 'customer'), DamageReportController.getMyReports);
router.delete('/:id', authMiddleware,roleMiddleware( 'customer'), DamageReportController.deleteReport);

// Admin/Owner routes
router.get('/', authMiddleware, roleMiddleware('admin'), DamageReportController.getAllReports);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), DamageReportController.updateReportStatus);
router.get(
  '/owner',
  authMiddleware,
  roleMiddleware('owner'),
  DamageReportController.getOwnerDamageReports // new method
);


module.exports = router;