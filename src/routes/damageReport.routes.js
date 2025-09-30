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
  upload.array('images', 5),
  DamageReportController.createDamageReport
);

router.get('/my', authMiddleware, DamageReportController.getMyReports);
router.delete('/:id', authMiddleware, DamageReportController.deleteReport);

// Admin/Owner routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'owner']), DamageReportController.getAllReports);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin', 'owner']), DamageReportController.updateReportStatus);

module.exports = router;