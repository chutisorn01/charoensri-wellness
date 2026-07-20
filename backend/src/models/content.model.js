const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  body: {
    type: String,
    required: [true, 'Please add the content body'],
  },
  imageUrl: {
    type: String,
    default: 'no-photo.jpg'
  },
  videoUrl: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: 'Admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
