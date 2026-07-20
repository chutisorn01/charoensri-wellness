const Gallery = require('../models/gallery.model');

// @desc    Get all gallery photos
// @route   GET /api/gallery
// @access  Public
exports.getGalleries = async (req, res, next) => {
  try {
    const galleries = await Gallery.find().sort('-createdAt');
    res.status(200).json({ success: true, count: galleries.length, data: galleries });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a gallery photo
// @route   POST /api/gallery
// @access  Private/Admin
exports.createGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.create(req.body);
    res.status(201).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a gallery photo
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, error: 'Gallery photo not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
