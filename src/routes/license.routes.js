const express = require("express");
const router = express.Router();
const uploadLicense = require("../middlewares/uploadLicenseMemory");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware"); // for owner/admin role
const {
  uploadLicenseToMongo,
  viewLicenseByOwner,
  verifyLicenseByOwner,
} = require("../controllers/license.controller");

// Customer uploads license
router.post(
  "/:bookingId/upload-license",
  authMiddleware,
  roleMiddleware("customer"),
  uploadLicense,
  uploadLicenseToMongo
);

// Owner views license
router.get(
  "/:bookingId/view-license",
  authMiddleware,
  roleMiddleware("owner"),
  viewLicenseByOwner
);

// Owner verifies license
router.patch(
  "/:bookingId/verify-license",
  authMiddleware,
  roleMiddleware("owner"),
  verifyLicenseByOwner
);

module.exports = router;
