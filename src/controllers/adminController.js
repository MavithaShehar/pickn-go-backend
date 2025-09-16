const User = require("../models/user.model");
const Vehicle = require("../models/vehicle.model");
const Complaint = require("../models/complaint.model");
const Booking = require("../models/booking.model");
const Payment = require("../models/payment.model");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//  DUMMY ADMIN
const dummyAdmin = {
  _id: "admin123",          
  name: "Admin User",
  email: "admin@example.com",
  password: bcrypt.hashSync("admin123", 10),
  role: "admin",
};

//  ADMIN LOGIN 
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check against dummy admin
    if (email !== dummyAdmin.email) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, dummyAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: dummyAdmin._id, role: dummyAdmin.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: dummyAdmin._id,
        name: dummyAdmin.name,
        email: dummyAdmin.email,
        role: dummyAdmin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  VERIFY USER 
exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { verification_status: status },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//  VERIFY VEHICLE 
exports.verifyVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { verification_status: status },
      { new: true }
    );

    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE ACCOUNT STATUS 
exports.updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid account status" });
    }

    const user = await User.findByIdAndUpdate(id, { account_status: status }, { new: true });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//  DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//GET ALL COMPLAINTS 
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("user_id", "name email");
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//  RESOLVE COMPLAINT 
exports.resolveComplaint = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["resolved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolved_at: new Date() },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalEarnings = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const activeUsers = await User.countDocuments({ account_status: "active" });
    const totalOwners = await User.countDocuments({ role: "owner", account_status: "active" });
    const totalCustomers = await User.countDocuments({ role: "customer", account_status: "active" });

    res.json({
      success: true,
      totalBookings,
      totalEarnings: totalEarnings[0]?.total || 0,
      activeUsers,
      totalOwners,
      totalCustomers,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//  GENERATE BOOKING REPORT
exports.generateBookingReport = async (req, res) => {
  try {
    const format = req.query.format || "pdf";
    const bookings = await Booking.find().populate("user_id vehicle_id");

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Bookings");
      sheet.columns = [
        { header: "User", key: "user", width: 30 },
        { header: "Vehicle", key: "vehicle", width: 30 },
        { header: "Date", key: "date", width: 20 },
      ];
      bookings.forEach(b =>
        sheet.addRow({ user: b.user_id.name, vehicle: b.vehicle_id.name, date: b.createdAt })
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=booking_report.xlsx");
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=booking_report.pdf");
      doc.pipe(res);
      bookings.forEach(b =>
        doc.text(`${b.user_id.name} - ${b.vehicle_id.name} - ${b.createdAt}`)
      );
      doc.end();
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
