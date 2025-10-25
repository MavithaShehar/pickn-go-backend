const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

// Middlewares
const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");

// Routes
const userRoutes = require("./routes/user.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const vehicleTypeRoutes = require("./routes/vehicleType.routes");
const fuelTypeRoutes = require("./routes/fuelType.routes");
const complaintRoutes = require('./routes/complaint.routes');
const searchRoutes = require("./routes/search.routes");
const bookingRoutes = require("./routes/booking.routes");
const reviewRoutes = require("./routes/review.routes");
const licenseRoutes = require("./routes/license.routes");
const reportRoutes = require("./routes/report.routes");
const vehicleBookingCountRoutes = require("./routes/vehicleBookingCount.routes");
const damageReportRoutes = require('./routes/damageReport.routes');
const imageRoutes = require('./routes/image.routes'); // ✅ image routes
const contactRoutes = require("./routes/contactUs.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

// ------------------ Middlewares ------------------
// Increase payload limits to handle large files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ------------------ Routes ------------------
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vehicle-types", vehicleTypeRoutes);
app.use("/api/fuel-types", fuelTypeRoutes);

app.use("/api/contact", contactRoutes);  // Public + admin access

app.use("/api/complaints", complaintRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookingRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Static uploads

app.use("/api/reviews", reviewRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/vehicle-bookings", vehicleBookingCountRoutes);
app.use("/api/damage-reports", damageReportRoutes);

// ------------------ Image Upload Routes ------------------
// Mount at /api so your routes are:
// PUT /api/profile/:userId/upload-photo
// POST /api/vehicle/:vehicleId/upload-images
app.use('/api', imageRoutes);

app.use("/api/notification", notificationRoutes);

// ------------------ Error Handling ------------------
// Not found handler
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);

module.exports = app;
