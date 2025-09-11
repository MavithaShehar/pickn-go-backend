const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "owner", "customer"], required: true },
  profilePhoto: { type: String },
  address: { type: String },
  verificationStatus: { type: Boolean, default: false },
  resetOTP: { type: String },
  resetOTPExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);