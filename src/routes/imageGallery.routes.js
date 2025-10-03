// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const {
  addImages,
  getAllImages,
  getImageById,
  getImageFile,
  updateImageById,
  deleteImageById
} = require('../controllers/imageGallery.controller');

const { uploadSingle, uploadArray, handleUploadErrors } = require('../middlewares/uploadMiddleware');

// POST /api/images — Add one or more images (auto-trim to 5)
router.post(
  '/images',
  uploadArray('images', 10),
  handleUploadErrors,
  addImages
);

// GET /api/images — View all images metadata (0 to 5)
router.get('/images', getAllImages);

// GET /api/images/:id — View specific image metadata
router.get('/images/:id', getImageById);

// GET /api/images/:id/file — Serve actual image file
router.get('/images/:id/file', getImageFile);

// PUT /api/images/:id — Edit specific image by ObjectId
router.put(
  '/images/:id',
  uploadSingle('image'),
  handleUploadErrors,
  updateImageById
);

// DELETE /api/images/:id — Delete specific image by ObjectId
router.delete('/images/:id', deleteImageById);

module.exports = router;