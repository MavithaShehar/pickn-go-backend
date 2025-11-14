const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================
// 🧩 Helper: Ensure folder exists
// ======================================
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// ======================================
// ⚙️ Multer Storage Configuration
// ======================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath;

    switch (req.uploadType) {
      case "profile":
        folderPath = path.join(__dirname, "..", "uploads", "images", "profiles");
        break;

      case "vehicle":
        folderPath = path.join(__dirname, "..", "uploads", "images", "vehicles");
        break;

      case "complaint":
        folderPath = path.join(__dirname, "..", "uploads", "images", "complaints");
        break;

      case "damageReports": // ✅ matches your routes
        folderPath = path.join(__dirname, "..", "uploads", "images", "damageReports");
        break;

      default:
        folderPath = path.join(__dirname, "..", "uploads", "images", "others");
        break;
    }

    ensureFolderExists(folderPath);
    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/\s+/g, "_");
    const uniqueName = `${timestamp}-${sanitizedName}`;
    cb(null, uniqueName);
  },
});

// ======================================
// 🧰 Multer Instance
// ======================================
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPG, JPEG & PNG image formats are allowed"));
    } else {
      cb(null, true);
    }
  },
});

module.exports = upload;
