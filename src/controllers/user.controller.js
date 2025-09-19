const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// Register
const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, role, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.status === "suspended") {
        return res.status(403).json({ message: "This account is suspended. You cannot register again." });
      }
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password: hashedPassword,
      role,
      verificationStatus: false, // default
      status: "active"           // default
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    next(err);
  }
};



// Login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    // if (user.role !== "admin" && !user.verificationStatus) {
    //   return res.status(403).json({ message: "Account is not verified yet" });
    // }

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

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(); // get all users
    res.json(users);
  } catch (err) {
    next(err);
  }
};


// Get Profile
const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
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
    const { email } = req.body;

    const user = await User.findOne({ email });
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

// Admin Verify User
// const adminVerifyUser = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.verificationStatus = true;
//     await user.save();

//     res.json({ message: "User verified successfully" });
//   } catch (err) {
//     next(err);
//   }
// };

// Admin Verify User
const adminVerifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = true;
    await user.save();

    // Send verification email
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

// Admin Verify Vehicle
const adminVerifyVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("ownerId");

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.verificationStatus = true;
    await vehicle.save();

    // Send verification email to owner
    if (vehicle.ownerId && vehicle.ownerId.email) {
      await sendEmail(
        vehicle.ownerId.email,
        "Vehicle Verified",
        `Your vehicle "${vehicle.title}" has been verified.`,
        `<p>Hello ${vehicle.ownerId.firstName},</p>
         <p>Your vehicle <b>${vehicle.title}</b> has been <b>verified</b> by admin and is now available for customers.</p>
         <p>Thank you,<br/>PicknGo Team</p>`
      );
    }

    res.json({ message: "Vehicle verified successfully and email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

const getUnverifiedUsers = async (req, res, next) => {
  try {
    const users = await User.find({ verificationStatus: false });

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
  adminVerifyVehicle,
};