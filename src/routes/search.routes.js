// search.routes.js
const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// Routes for separate search
router.get("/location", searchController.searchByLocation);
router.get("/price", searchController.searchByPrice);
router.get("/type", searchController.searchByVehicleType);

// Route for combined search
router.get("/combined", searchController.searchCombined);

module.exports = router;