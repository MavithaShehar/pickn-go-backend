const { body } = require("express-validator");

exports.validateVehicle = [
  body("title").notEmpty().withMessage("Title required"),
  body("pricePerKm").isNumeric().withMessage("Price per km must be numeric"),
  body("pricePerDay").isNumeric().withMessage("Price per day must be numeric"),
  body("location").notEmpty().withMessage("Location is required"),
];