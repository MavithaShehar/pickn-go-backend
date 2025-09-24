const express = require("express");
const router = express.Router();
const uploadLicense = require("../middlewares/uploadLicenseMemory");
const authMiddleware = require("../middlewares/authMiddleware"); // import auth
const { uploadLicenseToMongo } = require("../controllers/license.controller");

// Upload license endpoint with authentication
router.post(
  "/:bookingId/upload-license",
  authMiddleware,   // ✅ ensures req.user is defined
  uploadLicense,    // multer middleware
  uploadLicenseToMongo
);

module.exports = router;
