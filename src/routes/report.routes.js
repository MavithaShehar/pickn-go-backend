const express = require("express");
const ReportController = require("../controllers/report.controller");
const router = express.Router();

// Full vehicle report (JSON)
router.get("/vehicles", ReportController.getVehicleReport);

// Vehicle report filtered by status (JSON)
router.get("/vehicles/status", ReportController.getVehicleReportByStatus);

// Download vehicle report as PDF
router.get("/vehicles/pdf", ReportController.downloadVehicleReportPDF);

// Download vehicle report as Excel
router.get("/vehicles/excel", ReportController.downloadVehicleReportExcel);

// Users Report
router.get("/users", ReportController.getUserReport);

// User report (PDF download)
router.get("/users/pdf", ReportController.downloadUserReportPDF);

// User report (Excel download)
router.get("/users/excel", ReportController.downloadUserReportExcel);

// JSON preview
router.get("/vehicle-owners", ReportController.getVehicleOwnersReport);

// PDF download
router.get("/vehicle-owners/pdf", ReportController.downloadVehicleOwnersReportPDF);

// Excel download
router.get("/vehicle-owners/excel", ReportController.downloadVehicleOwnersReportExcel);


module.exports = router;
