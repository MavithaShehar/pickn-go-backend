// controllers/imageController.js
const imageService = require('../services/imageGallery.service');

// POST /api/images → add image(s) - ONLY returns added images info
const addImages = async (req, res) => {
  try {
    const result = await imageService.addImages(req);
    
    const response = {
      message: 'Images added successfully',
      addedCount: result.addedImages.length,
      addedImages: result.addedImages,
      totalImages: result.totalImages,
      limitReached: result.limitReached
    };
    
    // Only include removal info if images were actually removed
    if (result.removedCount > 0) {
      response.removedCount = result.removedCount;
      response.removedImages = result.removedImages;
      response.message = `Images added successfully. ${result.removedCount} oldest image(s) were removed to maintain limit.`;
    }
    
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/images → view all images (separate endpoint)
const getAllImages = async (req, res) => {
  try {
    const images = await imageService.getAllImages();
    res.json({ 
      images: images.map(img => ({ 
        _id: img._id,
        filename: img.filename,
        originalName: img.originalname,
        mimeType: img.mimetype,
        size: img.size,
        uploadedAt: img.uploadedAt,
        url: `/api/images/${img._id}/file`
      })),
      count: images.length,
      message: `Retrieved ${images.length} images`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// PUT /api/images/:id → edit specific image
const updateImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await imageService.updateImageById(id, req);
    res.json({
      message: `Image updated successfully`,
      image: {
        _id: updated._id,
        filename: updated.filename,
        originalName: updated.originalname,
        mimeType: updated.mimetype,
        size: updated.size,
        uploadedAt: updated.uploadedAt,
        url: `/api/images/${updated._id}/file`
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
  updateImageById,
  deleteImageById
};