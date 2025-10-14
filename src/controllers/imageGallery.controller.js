// controllers/imageGallery.controller.js
const imageService = require('../services/imageGallery.service');
const path = require('path');
const fs = require('fs');

const addImages = async (req, res) => {
  try {
    const result = await imageService.addImages(req);
    const response = {
      message: 'Images added successfully',
      addedCount: result.addedImages.length,
      addedImages: result.addedImages.map(img => ({
        _id: img._id,
        filename: img.filename,
        path: img.path, // ✅ CRITICAL: Add path field here
        originalName: img.originalname,
        mimeType: img.mimetype,
        size: img.size,
        uploadedAt: img.uploadedAt,
        url: `/api/images/${img._id}/file`
      })),
      totalImages: result.totalImages,
      limitReached: result.limitReached
    };

    if (result.removedCount > 0) {
      response.removedCount = result.removedCount;
      response.message = `Images added successfully. ${result.removedCount} oldest image(s) were removed to maintain limit.`;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Add images error:', error);
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
        path: img.path, // ✅ Already correct
        originalName: img.originalname,
        mimeType: img.mimetype,
        size: img.size,
        uploadedAt: img.uploadedAt,
        url: `/api/images/${img._id}/file`
      })),
      count: images.length
    });
  } catch (error) {
    console.error('❌ Get all images error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getImageById = async (req, res) => {
  try {
    const image = await imageService.getImageById(req.params.id);
    res.json({
      _id: image._id,
      filename: image.filename,
      path: image.path, // ✅ Already correct
      originalName: image.originalname,
      mimeType: image.mimetype,
      size: image.size,
      uploadedAt: image.uploadedAt,
      url: `/api/images/${image._id}/file`
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateImageById = async (req, res) => {
  try {
    const updated = await imageService.updateImageById(req.params.id, req);
    res.json({
      message: 'Image updated successfully',
      image: {
        _id: updated._id,
        filename: updated.filename,
        path: updated.path, // ✅ CRITICAL: Add path field here
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

const deleteImageById = async (req, res) => {
  try {
    const result = await imageService.deleteImageById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const serveImageFile = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await imageService.getImageById(id);

    // Send file using Express's sendFile (handles streaming, headers, etc.)
    return res.sendFile(image.path, {
      root: process.cwd(),
      headers: {
        'Content-Type': image.mimetype,
        'Content-Disposition': `inline; filename="${image.originalname}"`,
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    console.error('❌ Serve image error:', error.message);
    // Don't send JSON — send a real 404 image or empty response
    res.status(404).end(); // or send a default image
  }
};

module.exports = {
  addImages,
  getAllImages,
  getImageById,
  updateImageById,
  deleteImageById,
  serveImageFile
};