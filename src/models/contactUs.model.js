const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },

    // Store admin replies
    replies: [
      {
        subject: String,
        replyMessage: String,
        repliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactUs", contactSchema);
