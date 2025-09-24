const multer = require("multer");

// Store file in memory as buffer
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and PDF files are allowed"), false);
};

const upload = multer({ storage, fileFilter }).single("license");

const uploadLicense = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

module.exports = uploadLicense;
