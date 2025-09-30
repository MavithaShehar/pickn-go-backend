const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use memory storage to convert files to Base64
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg/jpeg/png images are allowed!'), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Middleware to handle multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Max 5MB allowed.' });
    }
    if (err.message.includes('Only jpg/jpeg/png')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  next();
};

// Helper to convert uploaded file(s) to Base64
const convertFilesToBase64 = (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = req.file.buffer.toString('base64'); // single file
    } else if (req.files) {
      req.body.images = req.files.map(file => file.buffer.toString('base64')); // multiple files
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error converting file to Base64', error: error.message });
  }
};

// Export helpers for single and multiple file uploads
module.exports = {
  uploadSingle: (fieldName) => [upload.single(fieldName), convertFilesToBase64],
  uploadArray: (fieldName, maxCount) => [upload.array(fieldName, maxCount), convertFilesToBase64],
  handleUploadErrors
};
