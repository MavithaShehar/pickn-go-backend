const express = require("express");
const router = express.Router();
const uploadLicense = require("../middlewares/uploadLicenseMemory");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  uploadLicenseToMongo,
  updateLicenseCustomer,
  updateLicenseOwner,
  viewLicense,
  deleteLicense,
} = require("../controllers/license.controller");

// ================================
// Upload License (Customer)
router.post(
  "/upload-license",
  authMiddleware,
  roleMiddleware("customer"),
  uploadLicense,
  uploadLicenseToMongo
);

// ================================
// Update License (Customer)
router.patch(
  "/update-license",
  authMiddleware,
  roleMiddleware("customer"),
  uploadLicense,
  updateLicenseCustomer
);

// ================================
// Update License (Owner)
router.patch(
  "/:userId/update-license",
  authMiddleware,
  roleMiddleware("owner"),
  updateLicenseOwner
);

// ================================
// View License
// Customer views own license
router.get(
  "/view-my-license",
  authMiddleware,
  roleMiddleware("customer"),
  viewLicense
);

// Owner views a customer's license
router.get(
  "/:userId/view-license",
  authMiddleware,
  roleMiddleware("owner"),
  viewLicense
);

// ================================
// Delete License
// Customer deletes own license
router.delete(
  "/delete-license",
  authMiddleware,
  roleMiddleware("customer"),
  deleteLicense
);

// Owner deletes a customer's license
router.delete(
  "/:userId/delete-license",
  authMiddleware,
  roleMiddleware("owner"),
  deleteLicense
);

module.exports = router;
