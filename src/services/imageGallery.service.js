// services/imageService.js
const ImageGallery = require('../models/imageGallery.model');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const MAX_IMAGES = 5;

// ADD one or more images (FIFO: remove oldest if needed)
const addImages = async (req) => {
  if (!req.files || req.files.length === 0) {
    throw new Error('At least one image is required');
  }

  const gallery = await ImageGallery.getSingleton();
  
  // Create new images with file paths
  const newImages = req.files.map(file => ({
    filename: file.filename,
    path: file.path,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date()
  }));
  
  // Store current count before addition
  const initialCount = gallery.images.length;
  
  // Add new images and maintain FIFO limit
  gallery.images = [...gallery.images, ...newImages];
  const removedCount = gallery.images.length - MAX_IMAGES;
  
  let removedImages = [];
  if (removedCount > 0) {
    // Remove oldest files from disk and store removed image info
    removedImages = gallery.images.slice(0, removedCount);
    removedImages.forEach(image => {
      try {
        fs.unlinkSync(image.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    });
    
    gallery.images = gallery.images.slice(-MAX_IMAGES);
  }
  
  await gallery.save();
  
  // Return only added images and removal info
  const addedImagesWithIds = gallery.images.slice(-newImages.length).map(img => ({
    _id: img._id,
    filename: img.filename,
    originalName: img.originalname,
    mimeType: img.mimetype,
    size: img.size,
    uploadedAt: img.uploadedAt
  }));
  
  return {
    addedImages: addedImagesWithIds,
    removedCount: removedImages.length,
    removedImages: removedImages.map(img => ({
      _id: img._id,
      filename: img.filename
    })),
    totalImages: gallery.images.length,
    limitReached: gallery.images.length >= MAX_IMAGES
  };
};

// GET all images
const getAllImages = async () => {
  const gallery = await ImageGallery.getSingleton();
  return gallery.images;
};
// GET image by ObjectId


const getImageById = async (id, res) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  
  if (!image) {
    throw new Error('Image not found with this ID');
  }
   console.log('🔍 Looking for image:', {
    _id: image._id,
    storedPath: image.path,
    filename: image.filename
  });
  
  // FIX: Use the stored path directly (it's already absolute)
  if (!image.path || typeof image.path !== 'string') {
    throw new Error('Image path is invalid or missing');
  }
  
 

  // Check if file exists at the stored path
  if (!fs.existsSync(image.path)) {
    console.log('❌ File not found at:', image.path);
    console.log('📁 Current working directory:', process.cwd());
    throw new Error(`Image file not found at: ${image.path}`);
  }
  
  console.log('✅ File found, serving:', image.path);
  
  // Set appropriate headers and send the actual image file
  res.setHeader('Content-Type', image.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${image.originalName}"`);
  res.sendFile(path.resolve(filePath));
};


// UPDATE image by ObjectId
const updateImageById = async (id, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  if (!req.file) {
    throw new Error('No image file provided');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  
  if (!image) {
    throw new Error('No image found with this ID');
  }

  // Delete old file
  try {
    fs.unlinkSync(image.path);
  } catch (err) {
    console.error('Error deleting old file:', err);
  }

  // Update with new file
  image.filename = req.file.filename;
  image.path = req.file.path;
  image.originalName = req.file.originalname;
  image.mimeType = req.file.mimetype;
  image.size = req.file.size;
  image.uploadedAt = new Date();
  
  await gallery.save();
  return image;
};

// DELETE image by ObjectId
const deleteImageById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  
  if (!image) {
    throw new Error('No image found with this ID');
  }

  // Remove file from disk
  try {
    fs.unlinkSync(image.path);
  } catch (err) {
    console.error('Error deleting file:', err);
  }

  // Remove from database
  gallery.images.pull(id);
  await gallery.save();
  
  return { 
    message: 'Image deleted successfully', 
    deletedImageId: id,
    remainingCount: gallery.images.length 
  };
};

// GET the full gallery object (for debugging)
const getGallery = async () => {
  return await ImageGallery.getSingleton();
};

module.exports = {
  addImages,
  getAllImages,
  getImageById,
  updateImageById,
  deleteImageById,
  getGallery
};