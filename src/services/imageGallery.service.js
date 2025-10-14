// services/imageGallery.service.js
const ImageGallery = require('../models/imageGallery.model');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const MAX_IMAGES = 5;

const addImages = async (req) => {
  if (!req.files || req.files.length === 0) {
    throw new Error('At least one image is required');
  }

  const gallery = await ImageGallery.getSingleton();

    const newImages = req.files.map((file) => {
    // ✅ Windows path එක URL-friendly බවට හරවන්න
    const normalizedPath = file.path.replace(/\\/g, '/');

    return {
      filename: file.filename,
      path: normalizedPath, // ✅ මෙය DB එකේ සුරකියි
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date()
    };
  });

  gallery.images = [...gallery.images, ...newImages];

  let removedImages = [];
  const removedCount = gallery.images.length - MAX_IMAGES;
  if (removedCount > 0) {
    removedImages = gallery.images.slice(0, removedCount);
    removedImages.forEach((image) => {
      try {
        const filePath = path.isAbsolute(image.path)
          ? image.path
          : path.join(process.cwd(), image.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Failed to delete old image file:', err);
      }
    });
    gallery.images = gallery.images.slice(-MAX_IMAGES);
  }

  await gallery.save();

  // ✅ FIXED: Include PATH in response objects
  const addedImagesWithIds = gallery.images.slice(-newImages.length).map(img => ({
    _id: img._id,
    filename: img.filename,
    originalname: img.originalname,
    mimetype: img.mimetype,
    size: img.size,
    uploadedAt: img.uploadedAt,
    path: img.path // 🔑 THIS WAS MISSING!
  }));

  return {
    addedImages: addedImagesWithIds,
    removedCount: removedImages.length,
    removedImages: removedImages.map(img => ({ _id: img._id, filename: img.filename, path: img.path })),
    totalImages: gallery.images.length,
    limitReached: gallery.images.length >= MAX_IMAGES
  };
};

const getAllImages = async () => {
  const gallery = await ImageGallery.getSingleton();
  // ✅ FIXED: Ensure path is included in all responses
  return gallery.images.map(img => ({
    _id: img._id,
    filename: img.filename,
    originalname: img.originalname,
    mimetype: img.mimetype,
    size: img.size,
    uploadedAt: img.uploadedAt,
    path: img.path // 🔑 Include path here too
  }));
};

const getImageById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid image ID format');
  }
  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  if (!image) throw new Error('Image not found');
  
  // ✅ FIXED: Return complete image object with path
  return {
    _id: image._id,
    filename: image.filename,
    originalname: image.originalname,
    mimetype: image.mimetype,
    size: image.size,
    uploadedAt: image.uploadedAt,
    path: image.path // 🔑 Include path
  };
};

const updateImageById = async (id, req) => {
  if (!req.file) throw new Error('No image file provided');
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid image ID');

  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  if (!image) throw new Error('Image not found');

  // Delete old file
  const oldPath = path.isAbsolute(image.path) ? image.path : path.join(process.cwd(), image.path);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

  // Update with new file
  image.filename = req.file.filename;
  image.path = req.file.path;
  image.originalname = req.file.originalname;
  image.mimetype = req.file.mimetype;
  image.size = req.file.size;
  image.uploadedAt = new Date();

  await gallery.save();
  
  // ✅ FIXED: Return complete image object with path
  return {
    _id: image._id,
    filename: image.filename,
    originalname: image.originalname,
    mimetype: image.mimetype,
    size: image.size,
    uploadedAt: image.uploadedAt,
    path: image.path // 🔑 Include path
  };
};

const deleteImageById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid image ID');
  const gallery = await ImageGallery.getSingleton();
  const image = gallery.images.id(id);
  if (!image) throw new Error('Image not found');

  const filePath = path.isAbsolute(image.path) ? image.path : path.join(process.cwd(), image.path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  gallery.images.pull(id);
  await gallery.save();

  return {
    message: 'Image deleted successfully',
    deletedImageId: id,
    remainingCount: gallery.images.length
  };
};

module.exports = {
  addImages,
  getAllImages,
  getImageById,
  updateImageById,
  deleteImageById
};