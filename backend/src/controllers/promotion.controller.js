const Promotion = require('../models/promotion.model');

exports.getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().sort('-createdAt');
    res.status(200).json({ success: true, count: promotions.length, data: promotions });
  } catch (error) {
    next(error);
  }
};

exports.getPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

exports.createPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

exports.updatePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promotion) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

exports.deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
