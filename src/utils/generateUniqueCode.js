// utils/generate-unique-code.js
const User = require("../models/user.model");

async function generateUniqueCode(role) {
  // ✅ Get the current year, month and date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateString = `${year}${month}${day}`; // e.g., 20251008

  // ✅ Determine prefix
  let prefix = "";
  if (role === "owner") prefix = "OWNER";
  else if (role === "customer") prefix = "CUST";
  else prefix = "USER";

  // ✅ Count total users for this role in the whole database (not by date)
  const count = await User.countDocuments({ role });

  // ✅ Increment and pad with 6 digits (e.g., 000006)
  const number = String(count + 1).padStart(6, "0");

  // ✅ Final code: PREFIX-YYYYMMDD-000006
  return `${prefix}-${dateString}-${number}`;
}

module.exports = generateUniqueCode;
