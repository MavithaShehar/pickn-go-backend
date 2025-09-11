const { body } = require("express-validator");

exports.validateBooking = [
  body("vehicleId").notEmpty().withMessage("Vehicle ID required"),
  body("customerId").notEmpty().withMessage("Customer ID required"),
  body("bookingStartDate").isISO8601().withMessage("Start date required"),
  body("bookingEndDate").isISO8601().withMessage("End date required"),
];