// middlewares/validateUser.js
const { body, validationResult } = require("express-validator");

// --- Register validation ---
exports.validateUser = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("Valid email required"),
  body("phoneNumber")
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be 10–15 digits"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  body("confirmPassword")
    .custom((v, { req }) => v === req.body.password)
    .withMessage("Passwords do not match"),
];

// --- Reset password validation ---
exports.validateResetPassword = [
  body("email").trim().isEmail().withMessage("Valid email required"),
  body("otp").trim().notEmpty().withMessage("OTP is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  body("confirmNewPassword")
    .custom((v, { req }) => v === req.body.newPassword)
    .withMessage("Passwords do not match"),
];

// --- Edit profile validation ---
exports.validateEditProfile = [
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("email").optional().trim().isEmail().withMessage("Valid email required"),
  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be 10–15 digits"),
  body("addressLine1").optional().trim().notEmpty().withMessage("Address Line 1 cannot be empty"),
  body("addressLine2").optional().trim(),
  body("postalCode").optional().trim(),
];

// --- Common validator runner (replaces separate 'validate' middleware) ---
exports.handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
};
