// controllers/imageController.js
const imageService = require('../services/imageGallery.service');

// POST /api/images → add image(s)
const addImages = async (req, res) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({ message: 'images array is required' });
    }
    
    const result = await imageService.addImages(req.body.images);
    res.status(200).json({ 
      message: 'Images added successfully',
      addedCount: result.addedImages.length,
      addedImages: result.addedImages,
      totalImages: result.totalImages,
      allImages: result.images.map(img => ({ 
        _id: img._id, 
        mimeType: img.mimeType, 
        uploadedAt: img.uploadedAt 
      }))
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/images → view all
const getAllImages = async (req, res) => {
  try {
    const images = await imageService.getAllImages();
    res.json({ 
      images: images.map(img => ({ 
        _id: img._id, 
        mimeType: img.mimeType, 
        uploadedAt: img.uploadedAt 
      })),
      count: images.length,
      message: `Retrieved ${images.length} images`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/images/:id → view specific image
const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await imageService.getImageById(id);
    res.json({
      message: `Image retrieved successfully`,
      image: {
        _id: image._id,
        data: image.data, // Include base64 data for single image retrieval
        mimeType: image.mimeType,
        uploadedAt: image.uploadedAt
      }
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// PUT /api/images/:id → edit specific image
const updateImageById = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ message: 'image (base64) is required' });
    }
    const { id } = req.params;
    const updated = await imageService.updateImageById(id, req.body.image);
    res.json({
      message: `Image updated successfully`,
      image: {
        _id: updated._id,
        mimeType: updated.mimeType,
        uploadedAt: updated.uploadedAt
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/images/:id → delete specific image
const deleteImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await imageService.deleteImageById(id);
    res.json({
      message: `Image deleted successfully`,
      deletedImageId: result.deletedImageId,
      remainingCount: result.remainingCount
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  addImages,
  getAllImages,
  getImageById,
  updateImageById,
  deleteImageById
};