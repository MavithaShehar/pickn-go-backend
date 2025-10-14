// routes/imageGallery.routes.js
const express = require('express');
const router = express.Router();
const {
  addImages,
  getAllImages,
  getImageById,
  updateImageById,
  deleteImageById,
  serveImageFile
} = require('../controllers/imageGallery.controller');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { uploadSingle, uploadArray, handleUploadErrors } = require('../middlewares/uploadMiddleware');

// Upload images (admin only)
router.post(
  '/images',
  authMiddleware,
  roleMiddleware("admin"),
  uploadArray('images', 10),
  handleUploadErrors,
  addImages
);

// Update image (admin only)
router.put(
  '/images/:id',
  authMiddleware,
  roleMiddleware("admin"),
  uploadSingle('image'),
  handleUploadErrors,
  updateImageById
);

// Public routes
router.get('/images', getAllImages);
router.get('/images/:id', getImageById);
router.get('/images/:id/file', serveImageFile);

// Delete (admin only)
router.delete('/images/:id', authMiddleware, roleMiddleware("admin"), deleteImageById);

module.exports = router;