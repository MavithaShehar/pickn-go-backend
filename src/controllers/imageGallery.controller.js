const imageService = require('../services/imageGallery.service');
const fs = require('fs');
const path = require('path');

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

// GET /api/images → view all images
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
        originalName: updated.originalName,
        mimeType: updated.mimeType,
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

// GET /api/images/:id → Get single image metadata + file URL
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
    res.status(404).json({ message: error.message });
  }
};

// GET /api/images/:id/file → Serve the actual image file
const serveImageFile = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await imageService.getImageById(id);
    
    // ✅ Convert relative path to absolute
    const projectRoot = path.join(__dirname, '..', '..');
    const absolutePath = path.join(projectRoot, image.path);
    
    console.log('🖼️ Serving image:', {
      id: id,
      relativePath: image.path,
      absolutePath: absolutePath,
      exists: fs.existsSync(absolutePath)
    });
    
    // ✅ Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ File not found: ${absolutePath}`);
      return res.status(404).json({ 
        message: 'Image file not found on disk',
        relativePath: image.path,
        absolutePath: absolutePath,
        hint: 'Image files are not committed to git. Make sure uploads folder exists and contains the file.'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Serve the file
    res.sendFile(absolutePath);
  } catch (error) {
    console.error('❌ Error serving image:', error);
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