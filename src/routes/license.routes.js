const express = require("express");
const router = express.Router();
const uploadLicense = require("../middlewares/uploadLicenseMemory");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  uploadLicenseToMongo,
  updateLicenseCustomer,
  updateLicenseOwner,
   viewAllLicensesPaginated,
  viewLicense,
  deleteLicense,
   viewAllLicenses,  
} = require("../controllers/license.controller");

// ================================
// Upload License (Customer,owner)
router.post(
  "/upload-license",
  authMiddleware,
  roleMiddleware("customer","owner"),
  uploadLicense,
  uploadLicenseToMongo
);

// ================================
// Update License (Customer,owner)
router.patch(
  "/update-license",
  authMiddleware,
  roleMiddleware("customer","owner"),
  uploadLicense,
  updateLicenseCustomer
);

// ================================
// admin verify License 
router.patch(
  "/:userId/update-license",
  authMiddleware,
  roleMiddleware("admin"),
  updateLicenseOwner
);
// Admin - View All Licenses (Paginated)
router.get(
  "/admin/view-all-licenses/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  viewAllLicensesPaginated
);

// ================================
// View License
// Customer and owner views own license
router.get(
  "/view-my-license",
  authMiddleware,
  roleMiddleware("customer","owner"),
  viewLicense
);

// admin views a customer's license
router.get(
  "/:userId/view-license",
  authMiddleware,
  roleMiddleware("admin"),
  viewLicense
);

// ================================
// Delete License
// Customer ,owner deletes own license
router.delete(
  "/delete-license",
  authMiddleware,
  roleMiddleware("customer","owner"),
  deleteLicense
);

// admin deletes a customer's license
router.delete(
  "/:userId/delete-license",
  authMiddleware,
  roleMiddleware("admin"),
  deleteLicense
);
// Admin - View All Licenses
router.get(
  "/admin/view-all-licenses",
  authMiddleware,
  roleMiddleware("admin"),
  viewAllLicenses
);

module.exports = router;
