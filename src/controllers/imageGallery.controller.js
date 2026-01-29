const imageService = require('../services/imageGallery.service');
const path = require('path');
const fs = require('fs');

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
    
    if (result.removedCount > 0) {
      response.removedCount = result.removedCount;
      response.removedImages = result.removedImages;
      response.message = `Images added successfully. ${result.removedCount} oldest image(s) were removed to maintain limit.`;
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Add images error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getAllImages = async (req, res) => {
  try {
    const images = await imageService.getAllImages();
    res.json({ 
      images: images.map(img => ({ 
        _id: img._id,
        filename: img.filename,
        originalName: img.originalName,
        mimeType: img.mimeType,
        size: img.size,
        uploadedAt: img.uploadedAt,
        url: `/api/images/${img._id}/file`
      })),
      count: images.length,
      message: `Retrieved ${images.length} images`
    });
  } catch (error) {
    console.error('Get all images error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await imageService.updateImageById(id, req);
    res.json({
      message: `Image updated successfully`,
      image: {
        _id: updated._id,
        filename: updated.filename,
        originalName: updated.originalName,
        mimeType: updated.mimeType,
        size: updated.size,
        uploadedAt: updated.uploadedAt,
        url: `/api/images/${updated._id}/file`
      }
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(400).json({ message: error.message });
  }
};

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
    console.error('Delete image error:', error);
    res.status(404).json({ message: error.message });
  }
};

const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await imageService.getImageById(id);

    res.json({
      _id: image._id,
      filename: image.filename,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
      uploadedAt: image.uploadedAt,
      url: `/api/images/${image._id}/file`
    });
  } catch (error) {
    console.error('Get image by ID error:', error);
    res.status(404).json({ message: error.message });
  }
};

// ✅ Serve image from file system
const serveImageFile = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await imageService.getImageById(id);
    
    // Check if file exists on disk
    if (!fs.existsSync(image.absolutePath)) {
      console.log(`File not found: ${image.absolutePath}`);
      return res.status(404).json({ 
        message: 'Image file not found on server',
        path: image.path
      });
    }
    
    // Set headers
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${image.originalName || image.filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Serve file from disk
    res.sendFile(path.resolve(image.absolutePath));
    
  } catch (error) {
    console.error('Serve image file error:', error);
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  addImages,
  getAllImages,
  updateImageById,
  deleteImageById,
  getImageById,
  serveImageFile
};