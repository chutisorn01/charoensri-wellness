const Shop = require('../models/shop.model');

exports.getShopInfo = async (req, res, next) => {
  try {
    // Assuming there's only one shop info document
    const shop = await Shop.findOne();
    if (!shop) return res.status(404).json({ success: false, error: 'Shop info not found' });
    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    next(error);
  }
};

exports.updateShopInfo = async (req, res, next) => {
  try {
    let shop = await Shop.findOne();
    
    if (!shop) {
      // If it doesn't exist, create it
      shop = await Shop.create(req.body);
    } else {
      // Update existing
      shop = await Shop.findByIdAndUpdate(shop._id, req.body, { new: true, runValidators: true });
    }
    
    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    next(error);
  }
};
