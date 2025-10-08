const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactUs.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Public route (no authentication)
router.post("/", contactController.createMessage);

// Admin routes
router.get("/", authMiddleware, roleMiddleware("admin"), contactController.getAllMessages);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), contactController.deleteMessage);

module.exports = router;
