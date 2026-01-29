const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  //Store RELATIVE path (portable across machines)
  path: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
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

gallerySchema.statics.getSingleton = async function() {
  let gallery = await this.findOne();
  if (!gallery) {
    gallery = new this({ images: [] });
    await gallery.save();
  }
  return gallery;
};

module.exports = mongoose.model('ImageGallery', gallerySchema);