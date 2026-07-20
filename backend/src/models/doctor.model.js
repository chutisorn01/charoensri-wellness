const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a doctor/therapist name'],
    trim: true,
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
  },
  bio: {
    type: String,
    required: [true, 'Please add a bio'],
  },
  profileImageUrl: {
    type: String,
    default: 'no-photo.jpg'
  },
  experienceYears: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
