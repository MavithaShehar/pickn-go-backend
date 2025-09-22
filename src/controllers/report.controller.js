const ReportService = require("../services/report.service");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

class ReportController {
    // Full vehicle report (JSON)
    static async getVehicleReport(req, res) {
        try {
            const report = await ReportService.generateVehicleReport();
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to fetch vehicle report" });
        }
    }

    // Vehicle report filtered by status (JSON)
    static async getVehicleReportByStatus(req, res) {
        try {
            const status = req.query.status;
            if (!status)
                return res.status(400).json({ success: false, message: "Status query required" });

            const report = await ReportService.generateVehicleReportByStatus(status);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to fetch vehicle report by status" });
        }
    }

    // Download PDF report
    static async downloadVehicleReportPDF(req, res) {
        try {
            const report = await ReportService.generateVehicleReport();
            const vehicles = report.vehicles;

            const doc = new PDFDocument({ margin: 30, size: "A4" });

            // Set headers for PDF download
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=PicknGo_Vehicles_Details.pdf");

            doc.pipe(res);

            // PDF title
            doc.fontSize(20).text("PicknGo Vehicles Details", { align: "center" });
            doc.moveDown();

            // Summary
            doc.fontSize(12).text(`Total Vehicles: ${report.totalVehicles}`);
            doc.text(`Available Vehicles: ${report.availableVehicles}`);
            doc.text(`Unavailable Vehicles: ${report.unavailableVehicles}`);
            doc.moveDown();

            // Vehicle details
            vehicles.forEach((v, i) => {
                doc.text(
                    `${i + 1}. ${v.title} | Owner: ${v.ownerName || "N/A"} | Type: ${v.vehicleType || "N/A"} | Fuel: ${v.fuelType || "N/A"} | Status: ${v.status} | Price/Km: ${v.pricePerKm} | Price/Day: ${v.pricePerDay} | Location: ${v.location}`
                );
            });

            doc.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to download PDF report" });
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
                { header: "ID", key: "_id", width: 24 },
                { header: "Title", key: "title", width: 20 },
                { header: "Owner", key: "ownerName", width: 20 },
                { header: "Vehicle Type", key: "vehicleType", width: 15 },
                { header: "Fuel Type", key: "fuelType", width: 12 },
                { header: "Status", key: "status", width: 12 },
                { header: "Price/Km", key: "pricePerKm", width: 12 },
                { header: "Price/Day", key: "pricePerDay", width: 12 },
                { header: "Year", key: "year", width: 8 },
                { header: "Seats", key: "seats", width: 8 },
                { header: "Location", key: "location", width: 15 },
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
            res.status(500).json({ success: false, message: "Failed to download Excel report" });
        }
    }


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
            res.status(500).json({ success: false, message: "Failed to fetch Users report" });
        }
    }

    static async downloadUserReportPDF(req, res) {
        try {
            const report = await ReportService.generateUserReport();

            const users = report.users.filter(u => u.role === "customer");

            const doc = new PDFDocument({ margin: 30, size: "A4" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=PicknGo_Customers_Details.pdf");

            doc.pipe(res);

            doc.fontSize(20).text("PicknGo Customers Details", { align: "center" });
            doc.moveDown();

            doc.fontSize(12);
            doc.text(`Total Customers: ${report.totalCustomers}`);
            doc.moveDown();

            users.forEach((u, i) => {
                doc.text(
                    `${i + 1}. ${u.firstName} ${u.lastName} | Role: ${u.role} | Email: ${u.email} | Phone: ${u.phoneNumber} | Status: ${u.status}`
                );
            });

            doc.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to download User PDF report" });
        }
    }

    static async downloadUserReportExcel(req, res) {
        try {
            const report = await ReportService.generateUserReport();
            const users = report.users.filter(u => u.role === "customer");

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("PicknGo Users Details");

            worksheet.columns = [
                { header: "ID", key: "_id", width: 24 },
                { header: "First Name", key: "firstName", width: 15 },
                { header: "Last Name", key: "lastName", width: 15 },
                { header: "Email", key: "email", width: 25 },
                { header: "Phone", key: "phoneNumber", width: 15 },
                { header: "Role", key: "role", width: 12 },
                { header: "Status", key: "status", width: 12 },
                { header: "Address", key: "address", width: 20 },
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
            res.status(500).json({ success: false, message: "Failed to download User Excel report" });
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

            const doc = new PDFDocument({ margin: 30, size: "A4" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=PicknGo_Vehicle_Owners_Report.pdf"
            );

            doc.pipe(res);

            // Title
            doc.fontSize(20).text("PicknGo Vehicle Owners Report", { align: "center" });
            doc.moveDown();

            // Add each vehicle + owner
            report.forEach((v, i) => {
                doc.fontSize(12).text(
                    `${i + 1}. Vehicle: ${v.title} | Status: ${v.status} | Price/Km: ${v.pricePerKm} | Price/Day: ${v.pricePerDay} | Location: ${v.location}`
                );
                doc.text(
                    `Owner: ${v.ownerId?.firstName} ${v.ownerId?.lastName} | Email: ${v.ownerId?.email} | Phone: ${v.ownerId?.phoneNumber} | Role: ${v.ownerId?.role} | Status: ${v.ownerId?.status}`
                );
                doc.moveDown();
            });

            doc.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to download PDF report" });
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
}

module.exports = ReportController;
