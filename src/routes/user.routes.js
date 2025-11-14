const express = require("express");
const {
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
  getVerifiedUsers,
  getAllUsers,
  updateAvatar,
  getPaginatedAllUsers,
  getPaginatedVerifiedUsers,
  getPaginatedUnverifiedUsers
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  validateUser,
  validateResetPassword,
  validateEditProfile,
  handleValidation,
} = require("../middlewares/validateUser");

const multer = require("multer");

// ---------------- Multer Setup ----------------
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only jpg/jpeg/png images are allowed!"), false);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ---------------- Middleware to handle upload errors ----------------
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size too large. Max 5MB allowed." });
    }
    return res.status(400).json({ message: err.message });
  }
  next();
};

// ---------------- Middleware to convert uploaded file to Base64 ----------------
const convertAvatarToBase64 = (req, res, next) => {
  if (req.file) {
    req.body.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }
  next();
};

// ---------------- Router ----------------
const router = express.Router();

// ---------------- Public Routes ----------------
// Register user with avatar (form-data)
router.post(
  "/register",
  upload.single("avatar"),    // field name in form-data
  handleUploadErrors,
  convertAvatarToBase64,
  validateUser,
  handleValidation,
  registerUser
);




router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validateResetPassword, handleValidation, resetPassword);

// ---------------- Protected Routes ----------------
router.get("/profile", authMiddleware, getProfile);
router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  handleUploadErrors,
  convertAvatarToBase64,
  validateEditProfile,
  handleValidation,
  editProfile
);
router.delete("/profile", authMiddleware, deleteProfile);

// Update avatar separately
router.put("/profile/avatar", authMiddleware, upload.single("avatar"), handleUploadErrors, updateAvatar);

// Admin Paginated Routes
router.get(
  "/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  getPaginatedAllUsers
);

router.get(
  "/verified/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  getPaginatedVerifiedUsers
);

router.get(
  "/unverified/paginated",
  authMiddleware,
  roleMiddleware("admin"),
  getPaginatedUnverifiedUsers
);
// ---------------- Admin Routes ----------------
router.get("/alluser", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), adminDeleteUser);
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), adminVerifyUser);
router.patch("/:id/suspend", authMiddleware, roleMiddleware("admin"), adminSuspendUser);
router.get("/unverified", authMiddleware, roleMiddleware("admin"), getUnverifiedUsers);
router.get("/verified", authMiddleware, roleMiddleware("admin"), getVerifiedUsers);
// ================================


module.exports = router;
