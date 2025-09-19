const multer = require('multer');
const path = require('path');

// Ensure uploads folder exists
const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Handle Multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Max 5MB allowed.' });
    }
    if (err.message === 'Only image files are allowed!') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  next();
};

module.exports = {
  upload,
  handleUploadErrors
};