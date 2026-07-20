const express = require('express');
const router = express.Router();
const { getPromotions, getPromotion, createPromotion, updatePromotion, deletePromotion } = require('../controllers/promotion.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getPromotions)
  .post(protect, createPromotion);

router.route('/:id')
  .get(getPromotion)
  .put(protect, updatePromotion)
  .delete(protect, deletePromotion);

module.exports = router;
