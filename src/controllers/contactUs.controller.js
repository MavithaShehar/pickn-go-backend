const Contact = require("../models/contactUs.model");
const nodemailer = require("nodemailer");

// ===============================
// 1️⃣ Public: Create message
// ===============================
exports.createMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = await Contact.create({ firstName, lastName, email, message });
    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 2️⃣ Admin: View all messages
// ===============================
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 3️⃣ Admin: View single message (with replies)
// ===============================
exports.getMessageById = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    res.status(200).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 4️⃣ Admin: Delete message
// ===============================
exports.deleteMessage = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 5️⃣ Admin: Reply to message (via Email)
// ===============================
exports.replyToMessage = async (req, res) => {
  try {
    const { subject, replyMessage } = req.body;
    const { id } = req.params;

    const messageData = await Contact.findById(id);
    if (!messageData)
      return res.status(404).json({ message: "Message not found" });

    // Configure mail transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Compose email
    const mailOptions = {
      from: process.env.EMAIL_FROM, // from .env
      to: messageData.email,
      subject: subject || "Reply from PicknGo Support",
      text: `Dear ${messageData.firstName} ${messageData.lastName},\n\n${replyMessage}\n\nBest regards,\nPicknGo Support Team`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Save reply history
    const newReply = { subject, replyMessage };
    messageData.replies.push(newReply);
    await messageData.save();

    // Return updated message + latest reply
    res.status(200).json({
      message: "Reply sent successfully",
      data: messageData,
      latestReply: newReply,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reply" });
  }
};
