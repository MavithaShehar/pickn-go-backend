const express = require("express");
const ReportController = require("../controllers/report.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

// Full vehicle report (JSON)
router.get("/vehicles",authMiddleware, roleMiddleware("admin"), ReportController.getVehicleReport);

// Vehicle report filtered by status (JSON)
router.get("/vehicles/status",authMiddleware, roleMiddleware("admin"), ReportController.getVehicleReportByStatus);

// Download vehicle report as PDF
router.get("/vehicles/pdf",authMiddleware, roleMiddleware("admin"), ReportController.downloadVehicleReportPDF);

// Download vehicle report as Excel
router.get("/vehicles/excel",authMiddleware, roleMiddleware("admin"), ReportController.downloadVehicleReportExcel);

// Users Report
router.get("/users",authMiddleware, roleMiddleware("admin"), ReportController.getUserReport);

// User report (PDF download)
router.get("/users/pdf",authMiddleware, roleMiddleware("admin"), ReportController.downloadUserReportPDF);

// User report (Excel download)
router.get("/users/excel",authMiddleware, roleMiddleware("admin"), ReportController.downloadUserReportExcel);

// JSON preview
router.get("/vehicle-owners",authMiddleware, roleMiddleware("admin"), ReportController.getVehicleOwnersReport);

// PDF download
router.get("/vehicle-owners/pdf",authMiddleware, roleMiddleware("admin"), ReportController.downloadVehicleOwnersReportPDF);

// Excel download
router.get("/vehicle-owners/excel",authMiddleware, roleMiddleware("admin"), ReportController.downloadVehicleOwnersReportExcel);


module.exports = router;
