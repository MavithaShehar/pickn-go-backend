// src/server.js
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
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
const imageRoutes = require('./routes/imageGallery.routes');
const contactRoutes = require("./routes/contactUs.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan("dev"));

// ✅ SERVE STATIC FILES FIRST (before security middleware)
// This ensures static files don't get blocked by security headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath, stat) => {
    // Allow your frontend origin to access static files
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    // Optional: Add cache control for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// ✅ SECURITY MIDDLEWARES (after static files)
// CORS configuration for API routes
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

// Helmet security headers with proper configuration for static resources
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false, // Essential for loading images from different origins
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5000"], // Allow images from your backend
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vehicle-types", vehicleTypeRoutes);
app.use("/api/fuel-types", fuelTypeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/vehicle-bookings", vehicleBookingCountRoutes);
app.use("/api/damage-reports", damageReportRoutes);
app.use('/api', imageRoutes);
app.use('/api/notification', notificationRoutes);

// Error Handling Middleware (must be last)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;