// models/ImageGallery.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const gallerySchema = new mongoose.Schema({
  images: [imageSchema]
});

// Get or create singleton gallery
gallerySchema.statics.getSingleton = async function() {
  let gallery = await this.findOne();
  if (!gallery) {
    gallery = new this({ images: [] });
    await gallery.save();
  }
  return gallery;
};

// Maintain maximum 5 images (FIFO)
gallerySchema.methods.maintainMaxLimit = function() {
  if (this.images.length > 5) {
    this.images = this.images.slice(-5); // Keep only last 5
  }
  return this.images.length;
};

module.exports = mongoose.model('ImageGallery', gallerySchema);