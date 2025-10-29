const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folder exists
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
    } else if (req.uploadType === "vehicle") {
      folderPath = path.join(__dirname, "..", "uploads", "images", "vehicles");
    } else if (req.uploadType === "complaint") {
      folderPath = path.join(__dirname, "..", "uploads", "images", "complaints");
    } else {
      // default folder if type not specified
      folderPath = path.join(__dirname, "..", "uploads", "images", "others");
    }

    ensureFolderExists(folderPath);
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPG, JPEG & PNG Allowed"));
    } else {
      cb(null, true);
    }
  },
});

module.exports = upload;
