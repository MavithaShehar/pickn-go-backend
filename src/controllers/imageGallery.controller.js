// controllers/imageController.js
const imageService = require('../services/imageGallery.service'); // Fixed import

// POST /api/images → add image(s)
const addImages = async (req, res) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({ error: 'images array is required' });
    }
    
    const result = await imageService.addImages(req.body.images);
    res.status(200).json({ 
      message: 'Images added successfully',
      totalImages: result.images.length,
      images: result.images
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET /api/images → view all
const getAllImages = async (req, res) => {
  try {
    const images = await imageService.getAllImages();
    res.json({ 
      images, 
      count: images.length,
      message: `Retrieved ${images.length} images`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/images/:index → view specific image
const getImageByIndex = async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const image = await imageService.getImageByIndex(index);
    res.json({
      message: `Image retrieved from index ${index}`,
      image
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// PUT /api/images/:index → edit specific image
const updateImageByIndex = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ error: 'image (base64) is required' });
    }
    const index = parseInt(req.params.index);
    const updated = await imageService.updateImageByIndex(index, req.body.image);
    res.json({
      message: `Image at index ${index} updated successfully`,
      image: updated
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/images/:index → delete specific image
const deleteImageByIndex = async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const result = await imageService.deleteImageByIndex(index);
    res.json({
      message: `Image at index ${index} deleted successfully`,
      remainingCount: result.remainingCount
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  addImages,
  getAllImages,
  getImageByIndex,
  updateImageByIndex,
  deleteImageByIndex
};