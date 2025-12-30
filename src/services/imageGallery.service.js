const ImageGallery = require('../models/imageGallery.model');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const MAX_IMAGES = 5;

// ✅ Helper: Convert absolute path to relative path from project root
const getRelativePath = (absolutePath) => {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const relativePath = path.relative(projectRoot, absolutePath);
  // Normalize to forward slashes for cross-platform compatibility
  return relativePath.replace(/\\/g, '/');
};

// ✅ Helper: Convert relative path to absolute path
const getAbsolutePath = (relativePath) => {
  const projectRoot = path.resolve(__dirname, '..', '..');
  return path.join(projectRoot, relativePath);
};

// ✅ ADD images - Store file path in MongoDB, keep file on disk
const addImages = async (req) => {
  if (!req.files || req.files.length === 0) {
    throw new Error('At least one image is required');
  }

  const gallery = await ImageGallery.getSingleton();
  
  // Create new image records with RELATIVE paths
  const newImages = req.files.map(file => ({
    filename: file.filename,
    path: getRelativePath(file.path), // Store relative path
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date()
  }));
  
  // Maintain FIFO limit
  gallery.images = [...gallery.images, ...newImages];
  const removedCount = gallery.images.length - MAX_IMAGES;
  
  let removedImages = [];
  if (removedCount > 0) {
    removedImages = gallery.images.slice(0, removedCount);
    
    // Delete old files from disk
    removedImages.forEach(image => {
      try {
        const absolutePath = getAbsolutePath(image.path);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`✅ Deleted old file: ${image.filename}`);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    });
    
    gallery.images = gallery.images.slice(-MAX_IMAGES);
  }
  
  await gallery.save();
  
  const addedImagesWithIds = gallery.images.slice(-newImages.length).map(img => ({
    _id: img._id,
    filename: img.filename,
    originalName: img.originalName,
    mimeType: img.mimeType,
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

const getAllImages = async () => {
  const gallery = await ImageGallery.getSingleton();
  return gallery.images;
};

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
    const oldAbsolutePath = getAbsolutePath(image.path);
    if (fs.existsSync(oldAbsolutePath)) {
      fs.unlinkSync(oldAbsolutePath);
    }
  } catch (err) {
    console.error('Error deleting old file:', err);
  }

  // Update with new file
  image.filename = req.file.filename;
  image.path = getRelativePath(req.file.path);
  image.originalName = req.file.originalname;
  image.mimeType = req.file.mimetype;
  image.size = req.file.size;
  image.uploadedAt = new Date();
  
  await gallery.save();
  return image;
};

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
    const absolutePath = getAbsolutePath(image.path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }

  gallery.images.pull(id);
  await gallery.save();
  
  return { 
    message: 'Image deleted successfully', 
    deletedImageId: id,
    remainingCount: gallery.images.length 
  };
};

const getImageById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  if (!image) {
    throw new Error('No image found with this ID');
  }
  
  // Return with absolute path for serving
  return {
    ...image.toObject(),
    absolutePath: getAbsolutePath(image.path)
  };
};

const getGallery = async () => {
  return await ImageGallery.getSingleton();
};

module.exports = {
  addImages,
  getAllImages,
  updateImageById,
  deleteImageById,
  getGallery,
  getImageById
};