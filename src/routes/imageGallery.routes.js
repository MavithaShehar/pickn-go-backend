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

const { uploadSingle, uploadArray, handleUploadErrors } = require('../middlewares/uploadMiddleware');

// POST /api/images — Add one or more images (auto-trim to 5)
router.post(
  '/images',
  authMiddleware,
  roleMiddleware("admin"), // Only admin can add images
  uploadArray('images', 10),
  handleUploadErrors,
  addImages
);

// GET /api/images — View all images metadata (0 to 5)
router.get('/images', getAllImages);

// GET /api/images/:id/file — Serve the actual image file
router.get('/images/:id/file', serveImageFile);

// PUT /api/images/:id — Edit specific image by ObjectId
router.put(
  '/images/:id',
  authMiddleware,
  roleMiddleware("admin"),
  uploadSingle('image'),
  handleUploadErrors,
  updateImageById
);

// ✅ GET /api/images/:id — Get single image by ID
router.get('/images/:id', getImageById);

// DELETE /api/images/:id — Delete specific image by ObjectId
router.delete('/images/:id',
  authMiddleware,
  roleMiddleware("admin"),
  deleteImageById);

module.exports = router;