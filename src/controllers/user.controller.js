const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const generateUniqueCode = require("../utils/generateUniqueCode");
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
      city,
      district,
      address,
      gender, 
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

    // Validate city and district
    const cityTrim = (city || "").trim();
    if (!cityTrim) {
      return res.status(400).json({ message: "City is required" });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Gender validation
    if (!gender || !["male", "female"].includes(gender.toLowerCase())) {
      return res.status(400).json({ message: "Gender must be either 'male' or 'female'" });
    }

    // ✅ Generate unique code for new user
    const uniqueCode = await generateUniqueCode(role);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------- Create user ----------------
    const newUser = new User({
      firstName,
      lastName,
      email: emailNorm,
      phoneNumber,
      password: hashedPassword,
      role,
      addressLine1,
      addressLine2,
      postalCode,
      city,
      district,
      gender,
      uniqueCode,
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser };

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
      uniqueCode: user.uniqueCode, // 👈 return unique code on login too (optional)
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
      uniqueCode: user.uniqueCode, // 👈 include unique code in profile
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Edit Own Profile ----------------
const editProfile = async (req, res, next) => {
  try {
    const { firstName, lastName,  gender, email, phoneNumber, addressLine1, addressLine2, city, district, postalCode } = req.body;
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
    if (city !== undefined) updateFields.city = city.trim();
    if (district !== undefined) updateFields.district = district.trim();
    if (postalCode !== undefined) updateFields.postalCode = postalCode.trim();

      // ✅ Update gender with validation
    if (gender !== undefined) {
      const validGenders = ["male", "female"];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
      }
      updateFields.gender = gender;
    }

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
