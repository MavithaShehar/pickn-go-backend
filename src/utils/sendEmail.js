const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text = "", html = "" }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // secure only for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
