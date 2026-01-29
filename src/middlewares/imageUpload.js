const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folder exists before upload
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath;

    if (req.uploadType === "profile") {
      folderPath = path.join(__dirname, "..", "uploads", "images", "profiles");
    } else {
      folderPath = path.join(__dirname, "..", "uploads", "images", "vehicles");
    }

    ensureFolderExists(folderPath);
    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// Multer configuration
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // ✅ 20MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPG, JPEG & PNG Allowed"));
    } else {
      cb(null, true);
    }
  },
});

// ✅ Export upload middleware
module.exports = upload;
