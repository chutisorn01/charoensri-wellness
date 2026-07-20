const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../controllers/upload.controller');

// Health check route
router.get('/health', homeController.checkHealth);

// CMS Routes
router.use('/auth', require('./auth.routes'));
router.use('/contents', require('./content.routes'));
router.use('/promotions', require('./promotion.routes'));
router.use('/services', require('./service.routes'));
router.use('/doctors', require('./doctor.routes'));
router.use('/shop', require('./shop.routes'));
router.use('/gallery', require('./gallery.routes'));


// General file upload
router.post('/upload', protect, uploadImage);

module.exports = router;
