const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a promotion title'],
    trim: true,
  },
  discountDetails: {
    type: String,
    required: [true, 'Please add discount details'],
  },
  imageUrl: {
    type: String,
    default: 'no-photo.jpg'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Please add the end date for the promotion']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Promotion', promotionSchema);
