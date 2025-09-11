const { body } = require("express-validator");

exports.validateUser = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("phoneNumber").isLength({ min: 10 }).withMessage("Phone number required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
];