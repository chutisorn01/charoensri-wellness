const express = require('express');
const router = express.Router();
const { getShopInfo, updateShopInfo } = require('../controllers/shop.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getShopInfo)
  .post(protect, updateShopInfo) // Create or update
  .put(protect, updateShopInfo);

module.exports = router;
