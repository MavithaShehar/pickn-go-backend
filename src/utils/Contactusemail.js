const sendEmail = require('./sendEmail');

const handleContactSubmission = async ({ firstName, lastName, email, phone, message }) => {
  // Validate data
  if (!firstName || !lastName || !email || !phone || !message) {
    throw new Error('All fields are required');
  }

  // Email content
  const subject = `New Contact Form Submission from ${firstName} ${lastName}`;
  const text = `
    Name: ${firstName} ${lastName}
    Email: ${email}
    Phone: ${phone}
    Message: ${message}
  `;
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;

  // Send email
  await sendEmail({
    to: 'yasanjithmalindu@gmail.com',
    subject,
    text,
    html
  });
};

module.exports = { handleContactSubmission };