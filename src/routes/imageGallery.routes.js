// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const {
  addImages,
  getAllImages,
  getImageByIndex,
  updateImageByIndex,
  deleteImageByIndex
} = require('../controllers/imageGallery.controller');
const { uploadArray, uploadSingle, handleUploadErrors } = require('../middlewares/uploadMiddleware');



// POST /api/images — Add one or more images (auto-trim to 5)
router.post(
  '/images',
  uploadArray('images', 10),
  handleUploadErrors,
  addImages
);

// GET /api/images — View all images (0 to 5)
router.get('/images', getAllImages);

// GET /api/images/:index — View specific image (index 0-4)
router.get('/images/:index', getImageByIndex);

// PUT /api/images/:index — Edit specific image
router.put(
  '/images/:index',
  uploadSingle('image'),
  handleUploadErrors,
  updateImageByIndex
);

// DELETE /api/images/:index — Delete specific image
router.delete('/images/:index', deleteImageByIndex);

module.exports = router;