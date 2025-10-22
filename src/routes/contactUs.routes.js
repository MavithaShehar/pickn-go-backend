const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactUs.controller");
const authMiddleware = require("../middlewares/authMiddleware"); // optional
const roleMiddleware = require("../middlewares/roleMiddleware"); // optional

// Public
router.post("/", contactController.createMessage);

// Admin
router.get("/", contactController.getAllMessages);
router.get("/:id", contactController.getMessageById);
router.delete("/:id", contactController.deleteMessage);
router.post("/:id/reply", contactController.replyToMessage);

module.exports = router;
