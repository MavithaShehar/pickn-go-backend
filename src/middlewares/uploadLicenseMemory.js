const multer = require("multer");

// Store files in memory as buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and PDF files are allowed"), false);
};

// Handle multiple files: front and back images
const upload = multer({ storage, fileFilter }).fields([
  { name: "frontImage", maxCount: 1 },
  { name: "backImage", maxCount: 1 },
]);

const uploadLicense = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

module.exports = uploadLicense;
