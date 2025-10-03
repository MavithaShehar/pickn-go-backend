// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const {
  addImages,
  getAllImages,
  getImageById,
  updateImageById,
  deleteImageById
} = require('../controllers/imageGallery.controller');

const { uploadSingle, uploadArray, handleUploadErrors } = require('../middlewares/uploadMiddleware');

// POST /api/images — Add one or more images (max 10)
router.post(
  '/images',
  uploadArray('images', 10),   // ✅ no spread
  handleUploadErrors,
  addImages
);

// PUT /api/images/:id — Edit specific image by ObjectId
router.put(
  '/images/:id',
  uploadSingle('image'),       // ✅ no spread
  handleUploadErrors,
  updateImageById
);

// GET /api/images — View all images (0 to 5)
router.get('/images', getAllImages);

// GET /api/images/:id — View specific image by ObjectId
router.get('/images/:id', getImageById);


// DELETE /api/images/:id — Delete specific image by ObjectId
router.delete('/images/:id', deleteImageById);

module.exports = router;