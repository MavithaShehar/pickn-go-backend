const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---------------- Multer storage ----------------
// Changed to memoryStorage to enable Base64 conversion
const storage = multer.memoryStorage(); // ✅ only change here

// ---------------- File filter ----------------
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only jpg/jpeg/png images are allowed!'), false);
};

// ---------------- Multer instance ----------------
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize:  5* 1024 * 1024 } 
});

// ---------------- Handle upload errors ----------------
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Max 5MB allowed.' });
    }
    if (err.message.includes('Only jpg/jpeg/png')) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  next();
};

// ---------------- Convert uploaded files to Base64 ----------------
const convertFilesToBase64 = (req, res, next) => {
  try {
    if (!req.file && !req.files) return next();

    if (req.file) {
      // Single file
      req.body.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.files?.length) {
      // Multiple files
      req.body.images = req.files.map(
        file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
      );
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error converting file to Base64', error: error.message });
  }
};

// ---------------- Export helpers ----------------
module.exports = {
  uploadSingle: (fieldName) => upload.single(fieldName),
  uploadArray: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  handleUploadErrors,
  convertFilesToBase64 // ✅ added export
};
