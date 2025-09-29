const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const dir = './uploads';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Ensure vehicles folder exists
const vehicleDir = './uploads/vehicles';
if (!fs.existsSync(vehicleDir)) fs.mkdirSync(vehicleDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.baseUrl.includes('vehicles')) {
      cb(null, 'uploads/vehicles/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (req.baseUrl.includes('vehicles')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only jpg/jpeg/png images are allowed!'), false);
  } else if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

// Initialize multer instance (no .array() here)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Handle multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File size too large. Max 5MB allowed.' });
    if (err.message.includes('Only jpg/jpeg/png')) return res.status(400).json({ error: err.message });
    if (err.message === 'Only image files are allowed!') return res.status(400).json({ error: err.message });
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  next();
};

module.exports = {
  upload,
  handleUploadErrors
};
