// models/ImageGallery.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, 
  //  required: true
   },
  mimetype: { type: String, 
    //required: true
     },
  originalname: { type: String,
    // required: true
     },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
  images: [imageSchema]
});

gallerySchema.statics.getSingleton = async function () {
  let gallery = await this.findOne();
  if (!gallery) {
    gallery = new this({ images: [] });
    await gallery.save();
  }
  return gallery;
};

module.exports = mongoose.model('ImageGallery', gallerySchema);