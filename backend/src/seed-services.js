require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Service = require('./models/service.model');

connectDB();

const servicesData = [
  {
    name: 'นวดแผนไทย',
    description: 'ท่านวดกดจุดสะท้อนและยืดเหยียดร่างกายสไตล์ราชสำนัก เพื่อคลายเส้น ยืดพังผืด และบรรเทาความเมื่อยล้าอย่างมีประสิทธิภาพ',
    price: 300,
    durationMinutes: 60,
    imageUrl: '2.jpg',
    isActive: true
  },
  {
    name: 'นวดคอ บ่า ไหล่',
    description: 'เน้นบำบัดอาการออฟฟิศซินโดรมบริเวณกล้ามเนื้อรอบสะบัก คอ บ่า และไหล่โดยเฉพาะ เพื่อเพิ่มความยืดหยุ่นและผ่อนคลายจากการทำงาน',
    price: 250,
    durationMinutes: 45,
    imageUrl: '4.jpg',
    isActive: true
  },
  {
    name: 'นวดฝ่าเท้า',
    description: 'นวดกดจุดสะท้อนบริเวณฝ่าเท้า กระตุ้นการทำงานของอวัยวะภายใน ปรับสมดุลระบบหมุนเวียนโลหิตและฟื้นฟูร่างกายอย่างล้ำลึก',
    price: 250,
    durationMinutes: 45,
    imageUrl: '2.jpg',
    isActive: true
  },
  {
    name: 'นวดไทยออยล์',
    description: 'ผสมผสานศาสตร์การกดจุดแบบแผนไทยเข้ากับการใช้น้ำมันบริสุทธิ์ ช่วยผ่อนคลายกล้ามเนื้อที่ตึงเกร็งและบำรุงผิวพรรณไปพร้อมกัน',
    price: 450,
    durationMinutes: 60,
    imageUrl: '3.jpg',
    isActive: true
  },
  {
    name: 'นวดน้ำมันอโรม่า',
    description: 'การนวดผ่อนคลายกล้ามเนื้อด้วยน้ำมันสกัดจากธรรมชาติ กลิ่นอโรมาช่วยปรับสมดุลระบบประสาท ลดความตึงเครียดของสมองและอารมณ์',
    price: 600,
    durationMinutes: 90,
    imageUrl: '2.jpg',
    isActive: true
  },
  {
    name: 'นวดสครับ',
    description: 'ขัดเซลล์ผิวที่เสื่อมสภาพด้วยสครับธรรมชาติสูตรพิเศษ เผยผิวเนียนนุ่ม ชุ่มชื้น และแลดูกระจ่างใสอย่างเป็นธรรมชาติ',
    price: 550,
    durationMinutes: 60,
    imageUrl: '5.jpg',
    isActive: true
  },
  {
    name: 'นวดน้ำมันและสครับ',
    description: 'แพ็กเกจดูแลผิวและผ่อนคลายกล้ามเนื้อแบบครบวงจร ผสานการขัดสครับผลัดเซลล์ผิวกับการนวดน้ำมันอโรม่าบำรุงล้ำลึก',
    price: 800,
    durationMinutes: 90,
    imageUrl: '6.jpg',
    isActive: true
  },
  {
    name: 'นวดประคบสมุนไพร',
    description: 'การนวดไทยผสานพลังความร้อนจากลูกประคบสมุนไพรสด ช่วยขับของเสีย กระตุ้นการไหลเวียนโลหิต และคลายจุดปวดเมื่อยสะสม',
    price: 500,
    durationMinutes: 60,
    imageUrl: '3.jpg',
    isActive: true
  },
  {
    name: 'นวดครีมหอยทาก',
    description: 'นวดบำรุงฟื้นฟูผิวอย่างล้ำลึกด้วยครีมเมือกหอยทากเข้มข้น เพิ่มความชุ่มชื้น ลดเลือนริ้วรอย และคืนความยืดหยุ่นกระชับให้ผิว',
    price: 650,
    durationMinutes: 60,
    imageUrl: '2.jpg',
    isActive: true
  }
];

const seedServicesOnly = async () => {
  try {
    // Only delete and re-insert into services collection
    await Service.deleteMany({});
    console.log('Existing services cleared...');

    await Service.insertMany(servicesData);
    console.log(`Successfully seeded ${servicesData.length} spa services!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

seedServicesOnly();
