// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const {
  addImages,
  getAllImages,
  updateImageById,
  deleteImageById,
  getImageById,
  serveImageFile
} = require('../controllers/imageGallery.controller');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ✅ Import the multer instance directly (your current upload middleware)
// Adjust the path if your file is named differently (e.g., upload.js)
const upload = require('../middlewares/uploadMiddleware');

// Helper: Set uploadType for dynamic folder routing (profile/vehicles)
const setUploadType = (type) => {
  return (req, res, next) => {
    req.uploadType = type;
    next();
  };
};

// Error handler for multer (inline for simplicity, or extract to middleware if preferred)
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err.message && err.message.includes('Only JPG')) {
      return res.status(400).json({ message: 'Invalid file type', error: err.message });
    }
    return res.status(500).json({ message: 'Unexpected upload error', error: err.message });
  }
  next();
};

// POST /api/images — Add multiple images (e.g., vehicle/gallery images)
router.post(
  '/images',
  authMiddleware,
  roleMiddleware("admin"),
  setUploadType("vehicles"), // or "profile" if needed
  upload.array('images', 10),
  handleUploadErrors,
  addImages
);

// GET /api/gallaryimages — List all image metadata
router.get('/galleryimages', getAllImages);

// GET /api/images/:id/file — Serve actual image file
// router.get('/images/:id/file', serveImageFile);

// PUT /api/images/:id — Update a single image (with optional new file)
router.put(
  '/images/:id',
  authMiddleware,
  roleMiddleware("admin"),
  setUploadType("vehicles"), // or "profile"
  upload.single('image'),
  handleUploadErrors,
  updateImageById
);

// GET /api/gallaryimages/:id — Get single image metadata
router.get('/galleryimages/:id', getImageById);

// DELETE /api/images/:id — Delete image
router.delete(
  '/images/:id',
  authMiddleware,
  roleMiddleware("admin"),
  deleteImageById
);

module.exports = router;