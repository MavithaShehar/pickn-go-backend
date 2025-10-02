// services/imageService.js
const ImageGallery = require('../models/imageGallery.model');
const MAX_IMAGES = 5;

const parseBase64Image = (base64Str) => {
  const mimeTypeMatch = base64Str.match(/^([a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const data = base64Str.replace(/^[a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+;base64,/, '');
  return { data, mimeType, uploadedAt: new Date() };
};

// ADD one or more images (FIFO: remove oldest if needed to make space for new ones)
const addImages = async (base64Images) => {
  if (!Array.isArray(base64Images) || base64Images.length === 0) {
    throw new Error('At least one image is required');
  }

  const gallery = await ImageGallery.getSingleton();
  const newImages = base64Images.map(parseBase64Image);
  
  // Calculate how many old images we need to remove to make space
  const totalAfterAdd = gallery.images.length + newImages.length;
  const overflow = totalAfterAdd - MAX_IMAGES;
  
  let finalImages;
  
  if (overflow <= 0) {
    // No need to remove any images, just append all new ones
    finalImages = [...gallery.images, ...newImages];
  } else {
    // Remove oldest images to make space for new ones (FIFO)
    const imagesToKeep = gallery.images.slice(overflow);
    finalImages = [...imagesToKeep, ...newImages];
    
    console.log(`Removed ${overflow} oldest image(s) to make space for new ones`);
  }
  
  gallery.images = finalImages;
  return await gallery.save();
};

// GET all images
const getAllImages = async () => {
  const gallery = await ImageGallery.getSingleton();
  return gallery.images;
};

// GET one image by index (0 to 4)
const getImageByIndex = async (index) => {
  if (index < 0 || index >= MAX_IMAGES) {
    throw new Error(`Image index must be between 0 and ${MAX_IMAGES - 1}`);
  }
  const gallery = await ImageGallery.getSingleton();
  if (index >= gallery.images.length) {
    throw new Error('Image not found at this index');
  }
  return { index, ...gallery.images[index] };
};

// UPDATE image at specific index
const updateImageByIndex = async (index, base64Image) => {
  if (index < 0 || index >= MAX_IMAGES) {
    throw new Error(`Image index must be between 0 and ${MAX_IMAGES - 1}`);
  }
  const gallery = await ImageGallery.getSingleton();
  if (index >= gallery.images.length) {
    throw new Error('No image exists at this index');
  }

  const updatedImage = parseBase64Image(base64Image);
  gallery.images[index] = updatedImage;
  await gallery.save();
  return { index, ...updatedImage };
};

// DELETE image at specific index (shift left)
const deleteImageByIndex = async (index) => {
  if (index < 0 || index >= MAX_IMAGES) {
    throw new Error(`Image index must be between 0 and ${MAX_IMAGES - 1}`);
  }
  const gallery = await ImageGallery.getSingleton();
  if (index >= gallery.images.length) {
    throw new Error('No image exists at this index');
  }

  gallery.images.splice(index, 1); // Remove and shift left
  await gallery.save();
  return { message: 'Image deleted successfully', remainingCount: gallery.images.length };
};

// GET the full gallery object (for debugging)
const getGallery = async () => {
  return await ImageGallery.getSingleton();
};

module.exports = {
  addImages,
  getAllImages,
  getImageByIndex,
  updateImageByIndex,
  deleteImageByIndex,
  getGallery
};