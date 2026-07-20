const express = require('express');
const router = express.Router();
const { getGalleries, createGallery, deleteGallery } = require('../controllers/gallery.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getGalleries)
  .post(protect, createGallery);

router.route('/:id')
  .delete(protect, deleteGallery);

module.exports = router;
