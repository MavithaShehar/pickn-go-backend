// models/ImageGallery.js
const mongoose = require('mongoose');

const ImageItemSchema = new mongoose.Schema({
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

const ImageGallerySchema = new mongoose.Schema({
  images: [ImageItemSchema]
}, { timestamps: true });

// Ensure only one document exists
ImageGallerySchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({ images: [] });
  }
  return doc;
};

module.exports = mongoose.model('ImageGallery', ImageGallerySchema);