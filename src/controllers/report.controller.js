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
            res.status(500).json({
                success: false,
                message: "Failed to fetch Users report"
            });
        }
    }

    static async downloadUserReportPDF(req, res) {
        try {
            const report = await ReportService.generateUserReport();
            const users = report.users.filter(u => u.role === "customer");

            const doc = new PDFDocument({ margin: 40, size: "A4" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Customers_Details.pdf"
            );

            doc.pipe(res);

            // --- HEADER (Logo + Title + Date) ---
            const logoPath = path.join(__dirname, "..", "images", "pickngo_logo.jpg");
            const headerY = 30;

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, headerY, { width: 80 });
            } else {
                console.warn("Logo not found at:", logoPath);
            }

            // Title centered horizontally
            doc.font("Helvetica-Bold")
                .fontSize(18)
                .text("PicknGo Customers Details", 0, headerY + 20, { align: "center" });

            // Date below the title
            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica")
                .fontSize(10)
                .text(`Report Generated: ${generatedDate}`, 0, headerY + 45, { align: "center" });

            // Move cursor below header
            doc.moveDown(5);

            // --- TABLE HEADERS ---
            const tableTop = doc.y;
            const colWidths = [20, 100, 160, 100, 80, 50];
            const headers = ["No", "Name", "Email", "Address", "Phone", "Status"];

            let x = 40;
            doc.rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), 20)
                .fill("#0074D9")
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            headers.forEach((header, i) => {
                doc.text(header, x + 3, tableTop + 6, { width: colWidths[i] - 6 });
                x += colWidths[i];
            });
            doc.fillColor("black");

            // --- TABLE ROWS ---
            let y = tableTop + 20;
            users.forEach((u, i) => {
                x = 40;
                const rowHeight = 50;

                if (i % 2 === 0) {
                    doc.rect(
                        40,
                        y,
                        colWidths.reduce((a, b) => a + b, 0),
                        rowHeight
                    ).fill("#f2f2f2").fillColor("black");
                }

                const address = [
                    u.addressLine1 || "",
                    u.addressLine2 || "",
                    u.postalCode || ""
                ].filter(Boolean).join(",\n"); // join with comma + line break

                const row = [
                    i + 1,
                    u.firstName + " " + u.lastName,
                    u.email || "N/A",
                    address || "N/A",
                    u.phoneNumber || "N/A",
                    u.status || "N/A",
                ];

                row.forEach((cell, j) => {
                    const width = colWidths[j];
                    const text = cell ? cell.toString() : "-";
                    doc.font("Helvetica").fontSize(9).fillColor("black");
                    doc.text(text, x + 3, y + 6, { width, continued: false });
                    x += width;
                });


                y += rowHeight;

                if (y > doc.page.height - 80) { // leave space for summary
                    doc.addPage();
                    y = 40;
                }
            });

            // --- SUMMARY BELOW TABLE ---
            doc.moveTo(40, y + 15);
            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text(`Total Customers: ${users.length}`, 40, y + 20);

            doc.end();
        } catch (error) {
            console.error("PDF Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to download User PDF report"
                });
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

            // --- HEADER (Logo + Title + Date) ---
            const logoPath = path.join(__dirname, "..", "images", "pickngo_logo.jpg");
            const headerY = 20;

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, headerY, { width: 80 });
            } else {
                console.warn("Logo not found at:", logoPath);
            }

            // Title centered horizontally
            doc.font("Helvetica-Bold")
                .fontSize(18)
                .text("PicknGo Vehicle Owners Details", 0, headerY + 20, { align: "center" });

            // Date below the title
            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica")
                .fontSize(10)
                .text(`Report Generated: ${generatedDate}`, 0, headerY + 45, { align: "center" });

            doc.moveDown(5);

            // --- TABLE HEADERS ---
            const tableTop = doc.y;
            const colWidths = [30, 100, 90, 120, 100, 50]; // Adjust to fit A4 width
            const headers = ["No", "Vehicle", "Owner", "Owner Contact", "Address", "Status"];


            let x = 40;
            const headerHeight = 25;


            doc.rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), headerHeight)
                .fill("#0074D9")   // blue background
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            let headerX = 40;
            headers.forEach((header, i) => {
                doc.text(header, headerX + 3, tableTop + 6, { width: colWidths[i] - 6 });
                headerX += colWidths[i];
            });

            doc.fillColor("black"); // reset text color for table rows

            let y = tableTop + 20;
            const fixedRowHeight = 50; // Set your desired row height

            report.forEach((v, i) => {
                x = 40;

                const row = [
                    i + 1,
                    v.vehicleName,
                    v.ownerName,
                    `${v.ownerEmail} | ${v.ownerPhone}`,
                    v.ownerAddress,
                    v.status,
                ];

                // Zebra background
                if (i % 2 === 0) {
                    doc.rect(40, y, colWidths.reduce((a, b) => a + b, 0), fixedRowHeight)
                        .fill("#f2f2f2")
                        .fillColor("black");
                }

                row.forEach((cell, j) => {
                    const width = colWidths[j];
                    doc.font("Helvetica").fontSize(9).fillColor("black");
                    doc.text(cell, x + 3, y + 6, { width, continued: false });
                    x += width;
                });

                y += fixedRowHeight;

                if (y > doc.page.height - 50) {
                    doc.addPage();
                    y = 40;
                }
            });


            // --- SUMMARY BELOW TABLE ---
            doc.moveTo(40, y + 15);
            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text(`Total Vehicles: ${report.length}`, 40, y + 20);

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

            // Define columns
            worksheet.columns = [
                { header: "No", key: "no", width: 6 },
                { header: "Vehicle Name", key: "vehicleName", width: 30 },
                { header: "Owner Name", key: "ownerName", width: 25 },
                { header: "Owner Email", key: "ownerEmail", width: 30 },
                { header: "Owner Phone", key: "ownerPhone", width: 18 },
                { header: "Owner Address", key: "ownerAddress", width: 40 },
                { header: "Status", key: "status", width: 12 },
            ];

            // Add rows
            report.forEach((v, i) => {
                worksheet.addRow({
                    no: i + 1,
                    vehicleName: v.vehicleName,
                    ownerName: v.ownerName,
                    ownerEmail: v.ownerEmail,
                    ownerPhone: v.ownerPhone,
                    ownerAddress: v.ownerAddress,
                    status: v.status,
                });
            });

            // Set header style
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
            worksheet.getRow(1).height = 20;

            // Optional: set all rows to have wrap text
            worksheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
                row.alignment = { wrapText: true, vertical: "middle", horizontal: "left" };
                row.height = 25; // increase row height
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

            const doc = new PDFDocument({ margin: 40, size: "A4" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Vehicles_Report.pdf"
            );

            doc.pipe(res);

            // --- HEADER (Logo + Title + Date) ---
            const logoPath = path.join(__dirname, "..", "images", "pickngo_logo.jpg");
            const headerY = 20;

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, headerY, { width: 80 });
            }

            doc.font("Helvetica-Bold")
                .fontSize(18)
                .text("PicknGo Vehicles Report", 0, headerY + 20, { align: "center" });

            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica")
                .fontSize(10)
                .text(`Report Generated: ${generatedDate}`, 0, headerY + 45, { align: "center" });

            doc.moveDown(5);

            // --- TABLE HEADERS ---
            const tableTop = doc.y;
            const colWidths = [20, 100, 40, 30, 40, 40, 60, 70, 100]; // Adjust widths
            const headers = [
                "No",
                "Title",
                "Type",
                "Fuel",
                "Price/Km",
                "Price/Day",
                "Status",
                "Owner",
                "Owner Contact"
            ];

            const headerHeight = 35; // Header height
            let x = 40;

            doc.rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), headerHeight)
                .fill("#0074D9")
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            headers.forEach((header, i) => {
                doc.text(header, x + 3, tableTop + (headerHeight / 2) - 5, { width: colWidths[i] - 6 });
                x += colWidths[i];
            });

            doc.fillColor("black");

            // --- TABLE ROWS ---
            let y = tableTop + headerHeight;
            vehicles.forEach((v, i) => {
                x = 40;

                const ownerContact = `${v.ownerPhone || ""} | ${v.ownerEmail || ""}`;
                const vehicleTitle = v.title || "N/A";
                const ownerName = v.ownerName || "N/A";

                // Set a higher minimum row height
                const minRowHeight = 40; // <-- increase this to make rows taller

                // Calculate rowHeight based on content
                const rowHeight = Math.max(
                    minRowHeight,
                    doc.heightOfString(vehicleTitle, { width: colWidths[1] - 6, ellipsis: true, lineGap: 2 }) + 10,
                    doc.heightOfString(ownerName, { width: colWidths[7] - 6, ellipsis: true, lineGap: 2 }) + 10
                );

                const row = [
                    i + 1,
                    vehicleTitle,
                    v.vehicleType || "N/A",
                    v.fuelType || "N/A",
                    isFinite(v.pricePerKm) ? v.pricePerKm : "-",
                    isFinite(v.pricePerDay) ? v.pricePerDay : "-",
                    v.status || "N/A",
                    ownerName,
                    ownerContact || "N/A"
                ];

                // Zebra background
                if (i % 2 === 0) {
                    doc.rect(40, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                        .fill("#f2f2f2")
                        .fillColor("black");
                }

                // Draw each cell
                row.forEach((cell, j) => {
                    doc.font("Helvetica").fontSize(9).fillColor("black");
                    doc.text(cell, x + 3, y + 6, {
                        width: colWidths[j] - 6,
                        ellipsis: true,
                        lineGap: 2,
                        height: rowHeight - 10
                    });
                    x += colWidths[j];
                });

                y += rowHeight;

                if (y > doc.page.height - 50) {
                    doc.addPage();
                    y = 40;
                }
            });


            // --- SUMMARY BELOW TABLE ---
            doc.moveTo(40, y + 15);
            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text(`Total Vehicles: ${report.totalVehicles}`, 40, y + 20);
            doc.text(`Available Vehicles: ${report.availableVehicles}`);
            doc.text(`Unavailable Vehicles: ${report.unavailableVehicles}`);

            doc.end();
        } catch (error) {
            console.error("PDF Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: "Failed to download PDF report" });
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
                { header: "No", key: "no", width: 6 },
                { header: "Title", key: "title", width: 30 },
                { header: "Owner Name", key: "ownerName", width: 25 },
                { header: "Owner Contact", key: "ownerContact", width: 25 },
                { header: "Owner Address", key: "ownerAddress", width: 35 },
                { header: "Vehicle Type", key: "vehicleType", width: 20 },
                { header: "Fuel Type", key: "fuelType", width: 15 },
                { header: "Status", key: "status", width: 12 },
                { header: "Price/Km", key: "pricePerKm", width: 12 },
                { header: "Price/Day", key: "pricePerDay", width: 12 },
            ];

            // Add rows
            vehicles.forEach((v, i) => {
                worksheet.addRow({
                    no: i + 1,
                    title: v.title,
                    ownerName: v.ownerName,
                    ownerContact: `${v.ownerEmail} | ${v.ownerPhone}`,
                    ownerAddress: v.ownerAddress,
                    vehicleType: v.vehicleType,
                    fuelType: v.fuelType,
                    status: v.status,
                    pricePerKm: v.pricePerKm,
                    pricePerDay: v.pricePerDay,
                });
            });

            // Style header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
            worksheet.getRow(1).height = 25;

            // Wrap text and increase row height
            worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
                row.alignment = { wrapText: true, vertical: "middle", horizontal: "left" };
                row.height = 30;
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
            res.status(500).json({ success: false, message: "Failed to download Excel report" });
        }
    }

}

module.exports = ReportController;
