// services/imageService.js
const ImageGallery = require('../models/imageGallery.model');
const mongoose = require('mongoose');
const MAX_IMAGES = 5;

// ADD one or more images (FIFO: remove oldest if needed)
const addImages = async (base64Images) => {
  if (!Array.isArray(base64Images) || base64Images.length === 0) {
    throw new Error('At least one image is required');
  }

  const gallery = await ImageGallery.getSingleton();
  
  // Create new images (MongoDB will automatically generate _id)
  const newImages = base64Images.map(base64Str => {
    const mimeTypeMatch = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    const data = base64Str.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+;base64,/, '');
    
    return {
      data,
      mimeType,
      uploadedAt: new Date()
    };
  });
  
  // Add new images and maintain FIFO limit
  gallery.images = [...gallery.images, ...newImages];
  const removedCount = gallery.images.length - MAX_IMAGES;
  
  if (removedCount > 0) {
    gallery.images = gallery.images.slice(-MAX_IMAGES); // Keep last 5
    console.log(`Removed ${removedCount} oldest image(s) to maintain limit`);
  }
  
  await gallery.save();
  
  // Extract the newly added images with their generated _ids
  const addedImagesWithIds = gallery.images.slice(-newImages.length).map(img => ({
    _id: img._id,
    mimeType: img.mimeType,
    uploadedAt: img.uploadedAt
  }));
  
  return {
    addedImages: addedImagesWithIds,
    totalImages: gallery.images.length,
    images: gallery.images
  };
};

// GET all images
const getAllImages = async () => {
  const gallery = await ImageGallery.getSingleton();
  return gallery.images;
};

// GET one image by ObjectId
const getImageById = async (id) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  
  if (!image) {
    throw new Error('Image not found with this ID');
  }
  
  return image;
};

// UPDATE image by ObjectId
const updateImageById = async (id, base64Image) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  
  if (!image) {
    throw new Error('No image found with this ID');
  }

  // Parse base64 string
  const mimeTypeMatch = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const data = base64Image.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+;base64,/, '');
  
  // Update the image properties while preserving the _id
  image.data = data;
  image.mimeType = mimeType;
  image.uploadedAt = new Date(); // Update timestamp
  
  await gallery.save();
  
  return image;
};

// DELETE image by ObjectId
const deleteImageById = async (id) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  
  if (!image) {
    throw new Error('No image found with this ID');
  }

  // Remove the image subdocument
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