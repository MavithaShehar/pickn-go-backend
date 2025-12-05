const ImageGallery = require('../models/imageGallery.model');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const MAX_IMAGES = 5;

// ✅ Helper function to convert absolute path to relative
const getRelativePath = (absolutePath) => {
  // Get project root (assuming services folder is in src/)
  const projectRoot = path.join(__dirname, '..', '..');
  return path.relative(projectRoot, absolutePath).replace(/\\/g, '/');
};

// ADD one or more images (FIFO: remove oldest if needed)
const addImages = async (req) => {
  if (!req.files || req.files.length === 0) {
    throw new Error('At least one image is required');
  }

  const gallery = await ImageGallery.getSingleton();
  
  // ✅ Create new images with RELATIVE paths
  const newImages = req.files.map(file => {
    const relativePath = path.relative(
      path.resolve(__dirname, '..', '..'), // project root
      file.path // absolute path from multer
    );
    
    return {
      filename: file.filename,
      originalName: file.originalname,
      path: relativePath, // ✅ Save relative path
      mimeType: file.mimetype,
      size: file.size,
    };
  });
  
  const initialCount = gallery.images.length;
  
  // Add new images and maintain FIFO limit
  gallery.images = [...gallery.images, ...newImages];
  const removedCount = gallery.images.length - MAX_IMAGES;
  
  let removedImages = [];
  if (removedCount > 0) {
    removedImages = gallery.images.slice(0, removedCount);
    
    // ✅ Delete files using absolute path
    removedImages.forEach(image => {
      try {
        const projectRoot = path.join(__dirname, '..', '..');
        const absolutePath = path.join(projectRoot, image.path);
        
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log('🗑️ Deleted old file:', absolutePath);
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

// ✅ GET all images - මේකයි මග හැරුණේ!
const getAllImages = async () => {
  const gallery = await ImageGallery.getSingleton();
  return gallery.images;
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

  // ✅ Delete old file using absolute path
  try {
    const projectRoot = path.join(__dirname, '..', '..');
    const oldAbsolutePath = path.join(projectRoot, image.path);
    
    if (fs.existsSync(oldAbsolutePath)) {
      fs.unlinkSync(oldAbsolutePath);
      console.log('🗑️ Deleted old file:', oldAbsolutePath);
    }
  } catch (err) {
    console.error('Error deleting old file:', err);
  }

  // ✅ Update with new file (relative path)
  const relativePath = getRelativePath(req.file.path);
  
  image.filename = req.file.filename;
  image.path = relativePath; // ⬅️ Save relative path
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

  // ✅ Remove file from disk using absolute path
  try {
    const projectRoot = path.join(__dirname, '..', '..');
    const absolutePath = path.join(projectRoot, image.path);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log('🗑️ Deleted file:', absolutePath);
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

// GET the full gallery object (for debugging)
const getGallery = async () => {
  return await ImageGallery.getSingleton();
};

// GET image by ObjectId
const getImageById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);

  if (!image) {
    throw new Error('No image found with this ID');
  }
  
  return image;
};

// ✅ Export all functions
module.exports = {
  addImages,
  getAllImages,       
  updateImageById,
  deleteImageById,
  getGallery,
  getImageById
};