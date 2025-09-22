// emailTemplates.js

// Plain text template
exports.bookingConfirmationText = (user, booking) => `
Hello ${user.firstName} ${user.lastName},

Your booking has been confirmed 🎉

Booking Details:
----------------------------
Vehicle: ${booking.vehicleId.title}
Pickup Date: ${new Date(booking.bookingStartDate).toLocaleDateString()}
Drop-off Date: ${new Date(booking.bookingEndDate).toLocaleDateString()}
Total Price: $${booking.totalPrice}

Thank you for choosing PicknGo 🚗
We look forward to serving you.

This is an automated email. Please do not reply.
© ${new Date().getFullYear()} Pick-N-Go. All rights reserved.
`;

// HTML template with modern styling and logo at the bottom
exports.bookingConfirmation = (user, booking) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Confirmation</title>
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f6f8;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 30px auto;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  .header {
    background-color: #4CAF50;
    color: #ffffff;
    padding: 20px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
  }
  .content {
    padding: 30px 20px;
    color: #333333;
  }
  .content h2 {
    color: #4CAF50;
    font-size: 20px;
    margin-bottom: 10px;
  }
  .details {
    margin-top: 20px;
    border-collapse: collapse;
    width: 100%;
  }
  .details td {
    padding: 10px;
    border-bottom: 1px solid #e0e0e0;
  }
  .details td.label {
    font-weight: bold;
    width: 35%;
  }
  .button {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 25px;
    background-color: #4CAF50;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
  }
  .footer {
    background-color: #f4f6f8;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #888888;
  }
  .footer img {
    max-width: 120px;
    margin-top: 10px;
  }
  @media (max-width: 600px) {
    .container {
      margin: 10px;
    }
    .details td {
      display: block;
      width: 100%;
    }
    .details td.label {
      margin-top: 10px;
    }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Booking Confirmed 🎉</h1>
  </div>
  <div class="content">
    <h2>Hello ${user.firstName} ${user.lastName},</h2>
    <p>Thank you for choosing <b>PicknGo 🚗</b>.
     Your booking has been successfully confirmed. Here are your booking details:</p>
    <table class="details">
      <tr>
        <td class="label">Vehicle</td>
        <td>${booking.vehicleId.title}</td>
      </tr>
      <tr>
        <td class="label">Pickup Date</td>
        <td>${new Date(booking.bookingStartDate).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td class="label">Drop-off Date</td>
        <td>${new Date(booking.bookingEndDate).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td class="label">Total Price</td>
        <td>$${booking.totalPrice}</td>
      </tr>
    </table>
  </div>
  <div class="footer">
    This is an automated email. Please do not reply.<br>
    &copy; ${new Date().getFullYear()} PicknGo. All rights reserved.<br>
    <!-- Logo at the bottom -->
    <img src="http://i.imgur.com/xkNs6vC.jpeg" alt="PicknGo Logo" style="max-width:120px; margin-top:10px;">
</div>
</div>
</body>
</html>
`;
