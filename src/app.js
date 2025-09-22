const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
const userRoutes = require("./routes/user.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const vehicleTypeRoutes = require("./routes/vehicleType.routes");
const fuelTypeRoutes = require("./routes/fuelType.routes");
const complaintRoutes = require('./routes/complaint.routes');
const searchRoutes = require("./routes/search.routes");
const bookingRoutes = require("./routes/booking.routes");
const reviewRoutes = require("./routes/rate.and.review.routes");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vehicle-types", vehicleTypeRoutes);
app.use("/api/fuel-types", fuelTypeRoutes);

app.use("/api/complaints", complaintRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api/reviews", reviewRoutes);

// Not Found Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);



module.exports = app;