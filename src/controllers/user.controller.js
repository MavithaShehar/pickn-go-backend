const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// ---------------- Register ----------------
const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      role,
      addressLine1,
      addressLine2,
      postalCode,
      address,
      avatar, // from body or multer convert
    } = req.body;

    const emailNorm = (email || "").trim().toLowerCase();

    // Check for existing email
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      if (existingUser.status === "suspended") {
        return res.status(403).json({
          message: "This account is suspended. You cannot register again.",
        });
      }
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check for existing phone
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Validate address
    const line1 = (addressLine1 ?? address ?? "").trim();
    if (!line1) {
      return res.status(400).json({ message: "addressLine1 is required" });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------- Avatar Handling ----------------
    const DEFAULT_AVATAR =
      "data:image/png;base64,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";

    let profilePhoto;
    if (avatar && avatar.trim() !== "") {
      // ✅ use provided avatar (req.body.avatar from form-data or multer)
      profilePhoto = avatar;
    } else if (req.body.avatar) {
      profilePhoto = req.body.avatar;
    } else {
      // ❌ no avatar → use default
      profilePhoto = DEFAULT_AVATAR;
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: emailNorm,
      phoneNumber,
      password: hashedPassword,
      role,
      addressLine1: line1,
      addressLine2: (addressLine2 ?? "").trim(),
      postalCode: (postalCode ?? "").trim(),
      verificationStatus: false,
      status: "active",
      profilePhoto,
    });

    await newUser.save();

    const safeUser = newUser.toObject();
    delete safeUser.password;
    delete safeUser.resetOTP;
    delete safeUser.resetOTPExpires;

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Login ----------------
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
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto || null,
      token: generateToken(user._id, user.role || "customer"),
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Update Avatar / Profile Photo ----------------
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    user.profilePhoto = base64Image;

    await user.save();

    res.json({
      message: "Profile photo updated successfully",
      profilePhoto: user.profilePhoto,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Get All Users ----------------
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -resetOTP -resetOTPExpires");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// ---------------- Get Profile ----------------
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetOTP -resetOTPExpires"
    );
    res.json({
      ...user.toObject(),
      profilePhoto: user.profilePhoto || null,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Edit Own Profile ----------------
const editProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, addressLine1, addressLine2, postalCode } = req.body;
    const userId = req.user._id;

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    if (email && email.trim().toLowerCase() !== currentUser.email) {
      const emailNorm = email.trim().toLowerCase();
      const existingEmailUser = await User.findOne({ email: emailNorm });
      if (existingEmailUser) return res.status(400).json({ message: "Email already in use" });
    }

    if (phoneNumber && phoneNumber !== currentUser.phoneNumber) {
      const existingPhoneUser = await User.findOne({ phoneNumber });
      if (existingPhoneUser) return res.status(400).json({ message: "Phone number already in use" });
    }

    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName.trim();
    if (lastName !== undefined) updateFields.lastName = lastName.trim();
    if (email !== undefined) updateFields.email = email.trim().toLowerCase();
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber.trim();
    if (addressLine1 !== undefined) updateFields.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) updateFields.addressLine2 = addressLine2.trim();
    if (postalCode !== undefined) updateFields.postalCode = postalCode.trim();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password -resetOTP -resetOTPExpires");

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// ---------------- Delete Own Profile ----------------
const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ---------------- Admin Delete User ----------------
const adminDeleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted by admin" });
  } catch (err) {
    next(err);
  }
};

// ---------------- Forgot Password ----------------
const forgotPassword = async (req, res, next) => {
  try {
    const emailNorm = (req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    });

    const response = { message: "OTP sent to email" };
    if (process.env.NODE_ENV !== "production") response.devOtp = otp;

    res.json(response);
  } catch (err) {
    next(err);
  }
};

// ---------------- Reset Password ----------------
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

// ---------------- Admin Verify User ----------------
const adminVerifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = true;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Account Verified",
      text: "Your account has been verified successfully.",
      html: `<p>Hello,</p>
             <p>Your account has been <b>verified</b> successfully. You can now log in and use all features.</p>
             <p>Thank you,<br/>PicknGo Team</p>`,
    });

    res.json({ message: "User verified successfully and email sent" });
  } catch (err) {
    next(err);
  }
};

// ---------------- Admin Suspend User ----------------
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

// ---------------- Get Unverified Users ----------------
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
  editProfile,
  deleteProfile,
  adminDeleteUser,
  forgotPassword,
  resetPassword,
  adminVerifyUser,
  adminSuspendUser,
  getUnverifiedUsers,
  getAllUsers,
  updateAvatar,
};
