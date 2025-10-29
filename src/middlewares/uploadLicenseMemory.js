const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folder exists
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, "..", "uploads", "images", "licenses");
    ensureFolderExists(folderPath);
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG & PNG files are allowed"));
  }
};

// Multer instance: handle front and back images
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter,
}).fields([
  { name: "frontImage", maxCount: 1 },
  { name: "backImage", maxCount: 1 },
]);

// Middleware wrapper
const uploadLicenseDisk = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

module.exports = uploadLicenseDisk;
