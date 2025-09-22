const express = require("express");
const { createVehicle, getFilteredVehicles } = require("../controllers/search.controller");

const router = express.Router();

router.post("/create", createVehicle);    // NEW: Add this line
router.post("/filter", getFilteredVehicles);

module.exports = router;