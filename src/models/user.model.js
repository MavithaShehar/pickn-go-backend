const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },

    password: { type: String, required: true },

    // Role (defaults to "customer")
    role: {
      type: String,
      enum: ["admin", "owner", "customer"],
      default: "customer",
    },

    profilePhoto: { type: String, trim: true },

     // Gender field
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,   // make it required if needed
    },

    // Address fields
    addressLine1: { type: String, required: true, trim: true }, // required
    addressLine2: { type: String, trim: true },                 // optional
    postalCode: { type: String, trim: true },                   // optional

    verificationStatus: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended"],
      // default: "active",
    },

    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
