require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Models
const Admin = require('./models/admin.model');
const Service = require('./models/service.model');
const Promotion = require('./models/promotion.model');
const Content = require('./models/content.model');
const Doctor = require('./models/doctor.model');
const Shop = require('./models/shop.model');

connectDB();

const seedData = async () => {
  try {
    // 1. Clear existing database collections
    await Admin.deleteMany();
    await Service.deleteMany();
    await Promotion.deleteMany();
    await Content.deleteMany();
    await Doctor.deleteMany();
    await Shop.deleteMany();

    console.log('Database collections cleared...');

    // 2. Seed Admin
    await Admin.create({
      username: 'admin',
      password: 'Charoensri@Admin2026!'
    });
    console.log('Admin User Seeded! (admin / Charoensri@Admin2026!)');

    // 3. Seed Services
    const services = [
      {
        name: 'นวดแผนไทยโบราณ',
        description: 'ท่านวดกดจุดสะท้อนและยืดเหยียดร่างกายสไตล์ราชสำนัก เพื่อคลายเส้น ยืดพังผืด และบรรเทาความเมื่อยล้าอย่างมีประสิทธิภาพ',
        price: 300,
        durationMinutes: 60,
        imageUrl: '1.jpg',
        isActive: true
      },
      {
        name: 'นวดอโรม่าน้ำมันหอมระเหย',
        description: 'การนวดผ่อนคลายกล้ามเนื้อด้วยน้ำมันสกัดจากธรรมชาติ กลิ่นอโรมาช่วยปรับสมดุลระบบประสาท ลดความตึงเครียดของสมองและอารมณ์',
        price: 600,
        durationMinutes: 90,
        imageUrl: '2.jpg',
        isActive: true
      },
      {
        name: 'นวดประคบสมุนไพรสด',
        description: 'การนวดไทยผสานพลังความร้อนจากลูกประคบสมุนไพรไทย ช่วยขับของเสีย กระตุ้นการไหลเวียนโลหิต และคลายจุดปวดเมื่อยสะสม',
        price: 500,
        durationMinutes: 60,
        imageUrl: '3.jpg',
        isActive: true
      },
      {
        name: 'นวดคอ บ่า ไหล่ เพื่อสุขภาพ',
        description: 'เน้นบำบัดอาการออฟฟิศซินโดรมบริเวณกล้ามเนื้อรอบสะบัก คอ บ่า และไหล่โดยเฉพาะ เพื่อเพิ่มความยืดหยุ่นและผ่อนคลายจากการทำงาน',
        price: 250,
        durationMinutes: 45,
        imageUrl: '4.jpg',
        isActive: true
      }
    ];
    await Service.create(services);
    console.log('Sample Services Seeded!');

    // 4. Seed Promotions
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const promotions = [
      {
        title: 'โปรโมชันต้อนรับฤดูฝน ลดทันที 15%',
        discountDetails: 'รับส่วนลด 15% ทันที สำหรับบริการนวดน้ำมันอโรม่ากลิ่นลาเวนเดอร์และนวดสครับขัดผิวสปาตลอดฤดูกาลนี้',
        imageUrl: '1.jpg',
        validFrom: today,
        validUntil: nextMonth,
        isActive: true
      },
      {
        title: 'แพ็กเกจนวดคู่รักสุดฟิน จ่ายเพียง 1,000 บาท',
        discountDetails: 'แพ็กเกจนวดคู่รัก 2 ท่าน เลือกบริการนวดไทยโบราณหรือนวดน้ำมันอโรม่า 90 นาที จากราคาปกติรวม 1,200 บาท เหลือเพียง 1,000 บาทเท่านั้น',
        imageUrl: '2.jpg',
        validFrom: today,
        validUntil: nextMonth,
        isActive: true
      }
    ];
    await Promotion.create(promotions);
    console.log('Sample Promotions Seeded!');

    // 5. Seed Doctors / Therapists
    const doctors = [
      {
        name: 'แม่หมอศรี เจริญธรรม',
        specialty: 'นวดจัดกระดูกและการนวดบำบัดรักษาโรค',
        bio: 'ประสบการณ์ในการนวดจัดสรีระร่างกายและการรักษาโรคด้วยศาสตร์การแพทย์แผนไทยมากกว่า 15 ปี จบหลักสูตรนวดแผนไทยโดยตรงจากสถาบันการนวดวัดโพธิ์',
        profileImageUrl: '1.jpg',
        experienceYears: 15,
        isActive: true
      },
      {
        name: 'พี่นก กนกวรรณ',
        specialty: 'นวดอโรม่าผ่อนคลายและนวดสครับขัดผิวสปา',
        bio: 'ผู้เชี่ยวชาญการกดจุดนวดหน้า นวดสครับ และอโรม่าบำบัด มุ่งเน้นการผ่อนคลายกล้ามเนื้อที่อ่อนล้าสะสมจากการทำงานหนัก',
        profileImageUrl: '2.jpg',
        experienceYears: 8,
        isActive: true
      }
    ];
    await Doctor.create(doctors);
    console.log('Sample Staff/Therapists Seeded!');

    // 6. Seed Contents / Blog posts
    const contents = [
      {
        title: '5 ประโยชน์ของการนวดแผนไทยต่อร่างกายที่คุณอาจคาดไม่ถึง',
        description: 'การนวดแผนไทยไม่ได้แค่ช่วยบำบัดความเมื่อยล้าเพียงชั่วคราว แต่ส่งผลดีต่อระบบไหลเวียนโลหิต ระบบกระดูก และช่วยลดความเครียดได้ในระยะยาว',
        body: 'เนื้อหาเกี่ยวกับประโยชน์ของการนวดแผนไทย เช่น 1. ช่วยกระตุ้นระบบไหลเวียนเลือด 2. ช่วยคลายพังผืดกล้ามเนื้อ 3. ปรับสรีระร่างกาย 4. ช่วยให้ระบบย่อยอาหารทำงานดีขึ้น 5. ลดฮอร์โมนความเครียดและหลับลึกสบายยิ่งขึ้น',
        imageUrl: '3.jpg',
        author: 'เจริญศรีนวดไทย',
        isActive: true,
        publishedAt: today
      }
    ];
    await Content.create(contents);
    console.log('Sample Articles Seeded!');

    // 7. Seed Shop Information
    await Shop.create({
      aboutUsText: 'เจริญศรีนวดแผนไทย ร้านนวดเพื่อสุขภาพที่เน้นการให้บริการด้วยมาตรฐาน ความสะอาด และการดูแลลูกค้าอย่างใส่ใจด้วยแนวคิด "นวดถึงแผง แรงถึงใจ" เพื่อช่วยคลายความเมื่อยล้าและฟื้นฟูสุขภาพกายใจให้ดีที่สุด',
      address: '123 ถนนเพชรเกษม ตำบลหน้าเมือง อำเภอเมืองราชบุรี จังหวัดราชบุรี 70000',
      phone: '094-358-2662, 080-059-2451',
      email: 'info@charoensriwellness.com',
      openingHours: 'เปิดบริการทุกวัน เวลา 09:00 – 20:30 น.',
      socialLinks: {
        facebook: 'https://facebook.com/charoensriwellness',
        instagram: 'https://instagram.com/charoensriwellness',
        line: '@charoensri'
      }
    });
    console.log('Shop Configuration Seeded!');

    console.log('All sample database records successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeder encountered an error:', error);
    process.exit(1);
  }
};

seedData();
