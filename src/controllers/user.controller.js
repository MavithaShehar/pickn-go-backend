const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// Register
const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role, // no fallback here — model default handles it
      addressLine1,
      addressLine2,
      postalCode,
      // legacy support:
      address, // if old clients still send single-line "address"
    } = req.body;

    const emailNorm = (email || "").trim().toLowerCase();

    // Uniqueness checks
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      if (existingUser.status === "suspended") {
        return res.status(403).json({
          message: "This account is suspended. You cannot register again.",
        });
      }
      return res.status(400).json({ message: "Email already in use" });
    }
    // Optional but recommended since phoneNumber is unique in schema
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Require addressLine1 (fallback to legacy "address" if provided)
    const line1 = (addressLine1 ?? address ?? "").trim();
    if (!line1) {
      return res.status(400).json({ message: "addressLine1 is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email: emailNorm,
      phoneNumber,
      password: hashedPassword,
      role, // schema default => "customer" if missing
      addressLine1: line1,
      addressLine2: (addressLine2 ?? "").trim(),
      postalCode: (postalCode ?? "").trim(),
      verificationStatus: false,
      status: "active",
    });

    await newUser.save();

    // return without sensitive fields
    const safeUser = newUser.toObject();
    delete safeUser.password;
    delete safeUser.resetOTP;
    delete safeUser.resetOTPExpires;

    res.status(201).json({ message: "User registered successfully", user: safeUser });
  } catch (err) {
    next(err);
  }
};

// Login
const loginUser = async (req, res, next) => {
  try {
    const emailNorm = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      id: user._id,
      email: user.email,
      role: user.role, // should be set (model default covers missing)
      token: generateToken(user._id, user.role || "customer"),
    });
  } catch (err) {
    next(err);
  }
};

// Get all users (hide sensitive fields)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -resetOTP -resetOTPExpires");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Get Profile (hide sensitive fields)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetOTP -resetOTPExpires");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Delete Own Profile
const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Admin Delete Any User
const adminDeleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted by admin" });
  } catch (err) {
    next(err);
  }
};

// Forgot Password - Generate OTP
const forgotPassword = async (req, res, next) => {
  try {
    const emailNorm = (req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP is ${otp}`,
      `<p>Your OTP is <b>${otp}</b></p>`
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const emailNorm = (req.body.email || "").trim().toLowerCase();
    const { otp, newPassword } = req.body;

    const user = await User.findOne({
      email: emailNorm,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

// Admin Verify User
const adminVerifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = true;
    await user.save();

    await sendEmail(
      user.email,
      "Account Verified",
      "Your account has been verified successfully.",
      `<p>Hello,</p>
       <p>Your account has been <b>verified</b> successfully. You can now log in and use all features.</p>
       <p>Thank you,<br/>PicknGo Team</p>`
    );

    res.json({ message: "User verified successfully and email sent" });
  } catch (err) {
    next(err);
  }
};

// Admin Suspend User
const adminSuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "suspended";
    await user.save();

    res.json({ message: "User suspended successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all unverified users (hide sensitive fields)
const getUnverifiedUsers = async (req, res, next) => {
  try {
    const users = await User.find({ verificationStatus: false }).select(
      "-password -resetOTP -resetOTPExpires"
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  deleteProfile,
  adminDeleteUser,
  forgotPassword,
  resetPassword,
  adminVerifyUser,
  adminSuspendUser,
  getUnverifiedUsers,
  getAllUsers,
};
