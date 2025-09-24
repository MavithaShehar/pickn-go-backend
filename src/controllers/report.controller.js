const moment = require("moment");
const fs = require("fs");
const path = require("path");
const pdfTable = require("pdfkit-table");
const ReportService = require("../services/report.service");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");


class ReportController {


    //User Reports
    static async getUserReport(req, res) {
        try {
            const report = await ReportService.generateUserReport();
            res.json({
                success: true,
                message: "Users report fetched successfully",
                data: report,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Failed to fetch Users report"});
        }
    }


    static async downloadUserReportPDF(req, res) {
        try {
            const report = await ReportService.generateUserReport();
            const users = report.users.filter(u => u.role === "customer");

            const doc = new PDFDocument({margin: 40, size: "A4"});

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Customers_Details.pdf"
            );

            doc.pipe(res);

            // --- Logo ---
            const logoPath = path.join(process.cwd(), "logo", "logo.jpg");
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, 20, {width: 80});
            }

            // --- Title ---
            doc.font("Helvetica-Bold").fontSize(20).text("PicknGo Customers Details", {
                align: "center",
            });
            doc.moveDown(0.5);

            // --- Date ---
            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica").fontSize(12).text(`Report Generated: ${generatedDate}`, {
                align: "center",
            });
            doc.moveDown(1);

            // --- Summary ---
            doc.font("Helvetica").fontSize(12).text(`Total Customers: ${users.length}`);
            doc.moveDown(1);

            // --- Table Headers ---
            const tableTop = doc.y;
            const colWidths = [30, 100, 100, 150, 100, 60]; // adjust as needed
            const headers = ["No", "First Name", "Last Name", "Email", "Phone", "Status"];

            let x = 40;
            doc.rect(x, tableTop, colWidths.reduce((a, b) => Number(a) + Number(b) || 50, 0), 20)
                .fill("#0074D9")
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            headers.forEach((header, i) => {
                doc.text(header, x + 3, tableTop + 6, {width: Number(colWidths[i]) - 6 || 50});
                x += Number(colWidths[i]) || 50;
            });
            doc.fillColor("black");

            // --- Table Rows ---
            let y = tableTop + 20;
            users.forEach((u, i) => {
                x = 40;
                const rowHeight = 20;

                if (i % 2 === 0) {
                    doc.rect(
                        40,
                        y,
                        colWidths.reduce((a, b) => Number(a) + Number(b) || 50, 0),
                        rowHeight
                    ).fill("#f2f2f2").fillColor("black");
                }

                const row = [
                    i + 1,
                    u.firstName || "N/A",
                    u.lastName || "N/A",
                    u.email || "N/A",
                    u.phoneNumber || "N/A",
                    u.status || "N/A",
                ];

                row.forEach((cell, j) => {
                    try {
                        const width = Number(colWidths[j]) || 50;
                        const text = cell !== undefined && cell !== null ? cell.toString() : "-";
                        doc.font("Helvetica").fontSize(9).fillColor("black");
                        doc.text(text, Number(x) + 3, Number(y) + 6, {width});
                    } catch (err) {
                        console.warn(`Skipped cell at row ${i}, col ${j}:`, err);
                        doc.text("-", Number(x) + 3, Number(y) + 6, {width: Number(colWidths[j]) || 50});
                    }
                    x += Number(colWidths[j]) || 50;
                });

                y += rowHeight;

                // Add new page if needed
                if (y > doc.page.height - 50) {
                    doc.addPage();
                    y = 40;
                }
            });

            doc.end();
        } catch (error) {
            console.error("PDF Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({success: false, message: "Failed to download User PDF report"});
            }
        }
    }

    static async downloadUserReportExcel(req, res) {
        try {
            const report = await ReportService.generateUserReport();
            const users = report.users.filter(u => u.role === "customer");

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("PicknGo Users Details");

            worksheet.columns = [
                {header: "ID", key: "_id", width: 24},
                {header: "First Name", key: "firstName", width: 15},
                {header: "Last Name", key: "lastName", width: 15},
                {header: "Email", key: "email", width: 25},
                {header: "Phone", key: "phoneNumber", width: 15},
                {header: "Role", key: "role", width: 12},
                {header: "Status", key: "status", width: 12},
                {header: "Address", key: "address", width: 20},
            ];

            users.forEach(u => {
                worksheet.addRow({
                    _id: u._id.toString(),
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    phoneNumber: u.phoneNumber,
                    role: u.role,
                    status: u.status,
                    address: u.address || "",
                });
            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Users_Details.xlsx"
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Failed to download User Excel report"});
        }
    }



    static async getVehicleOwnersReport(req, res) {
        try {
            const report = await ReportService.getVehicleOwnersReport();

            const formatted = report.map(v => ({
                vehicleId: v._id,
                title: v.title,
                description: v.description,
                year: v.year,
                seats: v.seats,
                location: v.location,
                status: v.status,
                pricePerKm: v.pricePerKm,
                pricePerDay: v.pricePerDay,
                vehicleType: v.vehicleTypeId?.name || "N/A",
                fuelType: v.fuelTypeId?.name || "N/A",
                owner: {
                    ownerId: v.ownerId?._id,
                    name: `${v.ownerId?.firstName} ${v.ownerId?.lastName}`,
                    email: v.ownerId?.email,
                    phone: v.ownerId?.phoneNumber,
                    role: v.ownerId?.role,
                    status: v.ownerId?.status,
                },
            }));

            res.status(200).json({ success: true, data: formatted });
        } catch (error) {
            console.error("Vehicle Owners Report Error:", error);
            res.status(500).json({ success: false, message: "Failed to generate report" });
        }
    }

    static async downloadVehicleOwnersReportPDF(req, res) {
        try {
            const report = await ReportService.getVehicleOwnersReport();

            const doc = new PDFDocument({ margin: 40, size: "A4" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Vehicle_Owners_Report.pdf"
            );

            doc.pipe(res);

            // --- Logo ---
            const logoPath = path.join(process.cwd(), "logo", "logo.jpg");
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, 20, { width: 80 });
            }

            // --- Title ---
            doc.font("Helvetica-Bold").fontSize(20).text("PicknGo Vehicle Owners Report", {
                align: "center",
            });
            doc.moveDown(0.5);

            // --- Date ---
            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica").fontSize(12).text(`Report Generated: ${generatedDate}`, {
                align: "center",
            });
            doc.moveDown(1.5);

            // --- Table Headers ---
            const tableTop = doc.y;
            const colWidths = [30, 90, 60, 50, 50, 50, 100, 150]; // adjust as needed
            const headers = [
                "No",
                "Vehicle",
                "Status",
                "Price/Km",
                "Price/Day",
                "City",
                "Owner",
                "Owner Contact",
            ];

            let x = 40;
            doc.rect(x, tableTop, colWidths.reduce((a, b) => Number(a) + Number(b) || 50, 0), 20)
                .fill("#0074D9")
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            headers.forEach((header, i) => {
                doc.text(header, x + 3, tableTop + 6, { width: Number(colWidths[i]) - 6 || 50 });
                x += Number(colWidths[i]) || 50;
            });
            doc.fillColor("black");

            // --- Table Rows ---
            let y = tableTop + 20;
            report.forEach((v, i) => {
                x = 40;
                const rowHeight = 20;

                if (i % 2 === 0) {
                    doc.rect(
                        40,
                        y,
                        colWidths.reduce((a, b) => Number(a) + Number(b) || 50, 0),
                        rowHeight
                    ).fill("#f2f2f2").fillColor("black");
                }

                const ownerName = v.ownerId
                    ? `${v.ownerId.firstName} ${v.ownerId.lastName}`
                    : "N/A";
                const ownerContact = v.ownerId
                    ? `${v.ownerId.email} | ${v.ownerId.phoneNumber}`
                    : "N/A";

                const row = [
                    i + 1,
                    v.title || "N/A",
                    v.status || "N/A",
                    isFinite(v.pricePerKm) ? v.pricePerKm : "-",
                    isFinite(v.pricePerDay) ? v.pricePerDay : "-",
                    v.city || "N/A",
                    ownerName,
                    ownerContact,
                ];

                row.forEach((cell, j) => {
                    try {
                        const width = Number(colWidths[j]) || 50;
                        const text = cell !== undefined && cell !== null ? cell.toString() : "-";
                        doc.font("Helvetica").fontSize(9).fillColor("black");
                        doc.text(text, Number(x) + 3, Number(y) + 6, { width });
                    } catch (err) {
                        doc.text("-", Number(x) + 3, Number(y) + 6, { width: Number(colWidths[j]) || 50 });
                    }
                    x += Number(colWidths[j]) || 50;
                });

                y += rowHeight;

                // Add new page if needed
                if (y > doc.page.height - 50) {
                    doc.addPage();
                    y = 40;
                }
            });

            doc.end();
        } catch (error) {
            console.error("PDF Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: "Failed to download PDF report" });
            }
        }
    }

    // Download Excel
    static async downloadVehicleOwnersReportExcel(req, res) {
        try {
            const report = await ReportService.getVehicleOwnersReport();

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("PicknGo Vehicle Owners");

            worksheet.columns = [
                { header: "Vehicle ID", key: "_id", width: 24 },
                { header: "Title", key: "title", width: 20 },
                { header: "Status", key: "status", width: 12 },
                { header: "Price/Km", key: "pricePerKm", width: 12 },
                { header: "Price/Day", key: "pricePerDay", width: 12 },
                { header: "Year", key: "year", width: 8 },
                { header: "Seats", key: "seats", width: 8 },
                { header: "Location", key: "location", width: 15 },
                { header: "Vehicle Type", key: "vehicleType", width: 15 },
                { header: "Fuel Type", key: "fuelType", width: 15 },
                { header: "Owner Name", key: "ownerName", width: 20 },
                { header: "Owner Email", key: "ownerEmail", width: 25 },
                { header: "Owner Phone", key: "ownerPhone", width: 15 },
                { header: "Owner Role", key: "ownerRole", width: 12 },
                { header: "Owner Status", key: "ownerStatus", width: 12 },
            ];

            report.forEach(v => {
                worksheet.addRow({
                    _id: v._id.toString(),
                    title: v.title,
                    status: v.status,
                    pricePerKm: v.pricePerKm,
                    pricePerDay: v.pricePerDay,
                    year: v.year || "",
                    seats: v.seats || "",
                    location: v.location,
                    vehicleType: v.vehicleTypeId?.name || "N/A",
                    fuelType: v.fuelTypeId?.name || "N/A",
                    ownerName: v.ownerId ? `${v.ownerId.firstName} ${v.ownerId.lastName}` : "N/A",
                    ownerEmail: v.ownerId?.email || "N/A",
                    ownerPhone: v.ownerId?.phoneNumber || "N/A",
                    ownerRole: v.ownerId?.role || "N/A",
                    ownerStatus: v.ownerId?.status || "N/A",
                });
            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Vehicle_Owners_Report.xlsx"
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to download Excel report" });
        }
    }



    // Full vehicle report (JSON)
    static async getVehicleReport(req, res) {
        try {
            const report = await ReportService.generateVehicleReport();
            res.status(200).json({success: true, data: report});
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Failed to fetch vehicle report"});
        }
    }

    // Vehicle report filtered by status (JSON)
    static async getVehicleReportByStatus(req, res) {
        try {
            const status = req.query.status;
            if (!status)
                return res.status(400).json({success: false, message: "Status query required"});

            const report = await ReportService.generateVehicleReportByStatus(status);
            res.status(200).json({success: true, data: report});
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Failed to fetch vehicle report by status"});
        }
    }

    // Download PDF report
    static async downloadVehicleReportPDF(req, res) {
        try {
            const report = await ReportService.generateVehicleReport();
            const vehicles = report.vehicles;

            const doc = new PDFDocument({margin: 40, size: "A4"});

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Vehicles_Details.pdf"
            );

            doc.pipe(res);

            // --- Logo ---
            const logoPath = path.join(process.cwd(), "logo", "logo.jpg");
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, 20, {width: 80});
            }

            // --- Title ---
            doc.font("Helvetica-Bold").fontSize(20).text("PicknGo Vehicles Report", {
                align: "center",
            });
            doc.moveDown(0.5);

            // --- Date ---
            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica").fontSize(12).text(`Report Generated: ${generatedDate}`, {
                align: "center",
            });
            doc.moveDown(1.5);

            // --- Table Headers ---
            const tableTop = doc.y;
            const colWidths = [30, 90, 100, 70, 70, 60, 60, 60]; // Adjust as needed
            const headers = [
                "No",
                "Title",
                "Owner",
                "Type",
                "Fuel",
                "Status",
                "Price/Km",
                "Price/Day",
            ];

            // Draw header
            let x = 40;
            doc.rect(x, tableTop, colWidths.reduce((a, b) => Number(a) + Number(b) || 50, 0), 20)
                .fill("#0074D9")
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            headers.forEach((header, i) => {
                doc.text(header, x + 3, tableTop + 6, {width: Number(colWidths[i]) - 6 || 50});
                x += Number(colWidths[i]) || 50;
            });
            doc.fillColor("black");

            // --- Table Rows ---
            let y = tableTop + 20;
            vehicles.forEach((v, i) => {
                x = 40;
                const rowHeight = 20;

                if (i % 2 === 0) {
                    doc.rect(
                        40,
                        y,
                        colWidths.reduce((a, b) => Number(a) + Number(b) || 50, 0),
                        rowHeight
                    ).fill("#f2f2f2").fillColor("black");
                }

                const row = [
                    i + 1,
                    v.title || "N/A",
                    v.ownerName || "N/A",
                    v.vehicleType || "N/A",
                    v.fuelType || "N/A",
                    v.status || "N/A",
                    isFinite(v.pricePerKm) ? v.pricePerKm : "-",
                    isFinite(v.pricePerDay) ? v.pricePerDay : "-",
                ];

                row.forEach((cell, j) => {
                    try {
                        const width = Number(colWidths[j]) || 50;
                        const text = cell !== undefined && cell !== null ? cell.toString() : "-";
                        doc.font("Helvetica").fontSize(9).fillColor("black");
                        doc.text(text, Number(x) + 3, Number(y) + 6, {width});
                    } catch (err) {
                        console.warn(`Skipped cell at row ${i}, col ${j}:`, err);
                        doc.text("-", Number(x) + 3, Number(y) + 6, {width: Number(colWidths[j]) || 50});
                    }
                    x += Number(colWidths[j]) || 50;
                });

                y += rowHeight;

                // Add new page if needed
                if (y > doc.page.height - 50) {
                    doc.addPage();
                    y = 40;
                }
            });

            // --- Totals Section ---
            doc.moveDown(2);
            doc.font("Helvetica-Bold").fontSize(12).text("=== Totals ===", {underline: true});
            doc.font("Helvetica").fontSize(12).text(`Total Vehicles: ${report.totalVehicles}`);
            doc.text(`Available Vehicles: ${report.availableVehicles}`);
            doc.text(`Unavailable Vehicles: ${report.unavailableVehicles}`);

            doc.end();
        } catch (error) {
            console.error("PDF Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({success: false, message: "Failed to download PDF report"});
            }
        }
    }

    // Download Excel report
    static async downloadVehicleReportExcel(req, res) {
        try {
            const report = await ReportService.generateVehicleReport();
            const vehicles = report.vehicles;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("PicknGo Vehicles Details");

            // Add header row
            worksheet.columns = [
                {header: "ID", key: "_id", width: 24},
                {header: "Title", key: "title", width: 20},
                {header: "Owner", key: "ownerName", width: 20},
                {header: "Vehicle Type", key: "vehicleType", width: 15},
                {header: "Fuel Type", key: "fuelType", width: 12},
                {header: "Status", key: "status", width: 12},
                {header: "Price/Km", key: "pricePerKm", width: 12},
                {header: "Price/Day", key: "pricePerDay", width: 12},
                {header: "Year", key: "year", width: 8},
                {header: "Seats", key: "seats", width: 8},
                {header: "Location", key: "location", width: 15},
            ];

            // Add rows
            vehicles.forEach(v => {
                worksheet.addRow({
                    _id: v._id.toString(),
                    title: v.title,
                    ownerName: v.ownerName || "N/A",
                    vehicleType: v.vehicleType || "N/A",
                    fuelType: v.fuelType || "N/A",
                    status: v.status,
                    pricePerKm: v.pricePerKm,
                    pricePerDay: v.pricePerDay,
                    year: v.year || "",
                    seats: v.seats || "",
                    location: v.location,
                });
            });

            // Set headers for Excel download
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Vehicles_Details.xlsx"
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Failed to download Excel report"});
        }
    }


}

module.exports = ReportController;
