const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const Vehicle = require("../models/vehicle.model");
const Review = require("../models/review.model");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// ------------------- User Auth -------------------

const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, role, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      address,
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const adminDeleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted by admin" });
  } catch (err) {
    next(err);
  }
};

// ------------------- Password Reset -------------------

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
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

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
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

// ------------------- Customer: Get Owner Details -------------------

const getOwnerDetails = async (req, res, next) => {
  try {
    const ownerId = req.params.ownerId;

    const owner = await User.findOne({ _id: ownerId, role: "owner" }).select("-password");
    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    const vehicles = await Vehicle.find({ owner: ownerId });
    const reviews = await Review.find({ owner: ownerId }).populate("customer", "firstName lastName email");

    res.json({
      success: true,
      owner,
      vehicles,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------- Exports -------------------

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  deleteProfile,
  adminDeleteUser,
  forgotPassword,
  resetPassword,
  getOwnerDetails, // new
};
