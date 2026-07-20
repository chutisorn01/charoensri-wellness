const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  aboutUsText: {
    type: String,
    required: true,
  },
  tagline: {
    type: String,
    default: 'นวดถึงแผง แรงถึงใจ'
  },
  logoUrl: {
    type: String,
    default: 'logo.JPG'
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  openingHours: {
    type: String,
    required: true,
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    line: String,
  },
  highlights: {
    type: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        iconType: { type: String, default: 'leaf' } // 'leaf' | 'sparkles' | 'heart'
      }
    ],
    default: [
      { title: 'นวดแผนไทยมาตรฐาน', description: 'ให้บริการนวดโดยผู้มีประสบการณ์ หมอนวดฝีมือดี ช่วยผ่อนคลายความเมื่อยล้าและฟื้นฟูร่างกาย', iconType: 'leaf' },
      { title: 'สถานที่สะอาด บรรยากาศผ่อนคลาย', description: 'พื้นที่แห่งการพักผ่อน เงียบสงบ อบอุ่น เพื่อให้ลูกค้ารู้สึกผ่อนคลายตั้งแต่ก้าวแรกที่เข้ามา', iconType: 'sparkles' },
      { title: 'ใส่ใจทุกขั้นตอน', description: 'ดูแลลูกค้าอย่างใส่ใจ ให้บริการด้วยความเป็นมิตร เพื่อสุขภาพกายและใจที่ดีที่สุดของคุณ', iconType: 'heart' }
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);
