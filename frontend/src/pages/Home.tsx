import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, Heart, ArrowRight, Menu, X, MapPin, Clock, Mail, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  isActive: boolean;
}

interface Promotion {
  _id: string;
  title: string;
  discountDetails: string;
  imageUrl: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface ShopInfo {
  aboutUsText: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    line?: string;
  };
  highlights?: {
    title: string;
    description: string;
    iconType: string;
  }[];
}

interface ContentItem {
  _id: string;
  title: string;
  description: string;
  body: string;
  imageUrl: string;
  videoUrl?: string;
  author: string;
  isActive: boolean;
  publishedAt: string;
}

interface GalleryItem {
  _id: string;
  imageUrl: string;
  title: string;
  isActive: boolean;
}

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Dynamic Data States
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const [servicesRes, promotionsRes, shopRes, contentsRes, galleryRes] = await Promise.all([
          fetch('http://localhost:5001/api/services'),
          fetch('http://localhost:5001/api/promotions'),
          fetch('http://localhost:5001/api/shop'),
          fetch('http://localhost:5001/api/contents'),
          fetch('http://localhost:5001/api/gallery')
        ]);

        const [servicesData, promotionsData, shopData, contentsData, galleryData] = await Promise.all([
          servicesRes.json(),
          promotionsRes.json(),
          shopRes.json(),
          contentsRes.json(),
          galleryRes.json()
        ]);

        if (servicesData.success) {
          // Filter only active services
          setServices(servicesData.data.filter((s: Service) => s.isActive !== false));
        }
        if (promotionsData.success) {
          // Filter only active promotions
          setPromotions(promotionsData.data.filter((p: Promotion) => p.isActive !== false));
        }
        if (contentsData.success) {
          // Filter only active contents
          setContents(contentsData.data.filter((c: ContentItem) => c.isActive !== false));
        }
        if (galleryData.success) {
          // Filter only active gallery photos
          setGalleries(galleryData.data.filter((g: GalleryItem) => g.isActive !== false));
        }
        if (shopInfoDataSuccess(shopData)) {
          setShopInfo(shopData.data);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Helper inside useEffect scope
    const shopInfoDataSuccess = (shopData: any) => {
      return shopData.success && shopData.data;
    };

    fetchHomepageData();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper to construct URL safety
  const formatUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'glass-dark' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="nav-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src="/logo/logo.JPG" alt="Logo" className="nav-logo" style={{ borderRadius: '50%' }} />
          เจริญศรีนวดแผนไทย
        </motion.div>
        
        {/* Hamburger Icon for Mobile */}
        <div className="hamburger" onClick={toggleMenu}>
          {menuOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
        </div>

        {/* Desktop & Mobile Links */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className={`nav-links ${menuOpen ? 'active' : ''}`}
        >
          <a className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>หน้าแรก</a>
          <a className="nav-link" onClick={() => scrollToSection('services')}>บริการของเรา</a>
          <a className="nav-link" onClick={() => scrollToSection('promotions')}>โปรโมชัน</a>
          <a className="nav-link" onClick={() => scrollToSection('contents')}>วิดีโอและบทความ</a>
          <a className="nav-link" onClick={() => scrollToSection('contact')}>ติดต่อเรา</a>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <img src="/image/bg.PNG" alt="เจริญศรีนวดแผนไทย" className="hero-bg" />
        <div className="hero-overlay"></div>
        
        <motion.div 
          className="hero-content glass"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="hero-subtitle">
            "นวดถึงแผง แรงถึงใจ"
          </motion.div>
          <motion.h1 variants={fadeIn} className="hero-title">
            เจริญศรีนวดแผนไทย
          </motion.h1>
          <motion.p variants={fadeIn} className="hero-description">
            {shopInfo?.aboutUsText || `ร้านนวดเพื่อสุขภาพที่มุ่งเน้นการให้บริการด้วยมาตรฐาน ความสะอาด และการดูแลลูกค้าอย่างใส่ใจ 
            เราออกแบบบรรยากาศให้เงียบสงบ อบอุ่น และเป็นกันเอง เพื่อให้ทุกครั้งที่มาใช้บริการเป็นช่วงเวลาแห่งการผ่อนคลายอย่างแท้จริง`}
          </motion.p>
          <motion.div variants={fadeIn} className="hero-actions">
            <button className="btn btn-primary" onClick={() => scrollToSection('contact')}>
              ติดต่อจองคิวนวด <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline" onClick={() => scrollToSection('services')}>
              ดูบริการของเรา
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          จุดเด่นของร้าน
        </motion.h2>
        
        <motion.div 
          className="features-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {shopInfo?.highlights && shopInfo.highlights.length >= 3 ? (
            shopInfo.highlights.map((hl, index) => (
              <motion.div key={index} variants={fadeIn} className="feature-card">
                <div className="feature-icon-wrapper">
                  {hl.iconType === 'leaf' ? <Leaf size={40} /> : 
                   hl.iconType === 'sparkles' ? <Sparkles size={40} /> : 
                   <Heart size={40} />}
                </div>
                <h3>{hl.title}</h3>
                <p>{hl.description}</p>
              </motion.div>
            ))
          ) : (
            <>
              <motion.div variants={fadeIn} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Leaf size={40} />
                </div>
                <h3>นวดแผนไทยมาตรฐาน</h3>
                <p>ให้บริการนวดโดยผู้มีประสบการณ์ หมอนวดฝีมือดี ช่วยผ่อนคลายความเมื่อยล้าและฟื้นฟูร่างกาย</p>
              </motion.div>
              
              <motion.div variants={fadeIn} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Sparkles size={40} />
                </div>
                <h3>สถานที่สะอาด บรรยากาศผ่อนคลาย</h3>
                <p>พื้นที่แห่งการพักผ่อน เงียบสงบ อบอุ่น เพื่อให้ลูกค้ารู้สึกผ่อนคลายตั้งแต่ก้าวแรกที่เข้ามา</p>
              </motion.div>
              
              <motion.div variants={fadeIn} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Heart size={40} />
                </div>
                <h3>ใส่ใจทุกขั้นตอน</h3>
                <p>ดูแลลูกค้าอย่างใส่ใจ ให้บริการด้วยความเป็นมิตร เพื่อสุขภาพกายและใจที่ดีที่สุดของคุณ</p>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>

      {/* Services List Section (Dynamic) */}
      <section id="services" className="services-list" style={{ padding: '80px 5%', backgroundColor: '#f9f9f9' }}>
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ color: 'var(--text-main)' }}
        >
          บริการของเรา
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '25px', 
            justifyContent: 'center' 
          }}
        >
          {loading ? (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูลบริการ...</p>
          ) : services.length > 0 ? (
            services.map((service) => (
              <motion.div 
                key={service._id}
                whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(31, 63, 47, 0.15)' }}
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(31, 63, 47, 0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={`/image/${service.imageUrl}`} 
                    alt={service.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/image/2.jpg';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    ฿{service.price}
                  </div>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '8px' }}>{service.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px', flex: 1, lineHeight: '1.5' }}>
                    {service.description}
                  </p>
                  <div style={{ 
                    borderTop: '1px solid #f0f0f0', 
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--accent)',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}>
                    <Clock size={16} /> ระยะเวลา: {service.durationMinutes} นาที
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Fallback tags if database is empty
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', gridColumn: '1 / -1' }}>
              {[
                'นวดแผนไทย', 'นวดคอ บ่า ไหล่', 'นวดฝ่าเท้า', 'นวดไทยออยล์', 
                'นวดน้ำมันอโรม่า', 'นวดสครับ', 'นวดน้ำมันและสครับ', 
                'นวดประคบสมุนไพร', 'นวดครีมหอยทาก'
              ].map((service, index) => (
                <div key={index} style={{ 
                  padding: '15px 30px', 
                  backgroundColor: 'white', 
                  borderRadius: '30px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  color: 'var(--primary)',
                  fontWeight: '500',
                  border: '1px solid rgba(31, 63, 47, 0.1)'
                }}>
                  ✨ {service}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Promotions Section (Dynamic & New) */}
      <section id="promotions" className="promotions-section" style={{ padding: '80px 5%', backgroundColor: 'white' }}>
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          โปรโมชันพิเศษ
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '30px', 
            justifyContent: 'center' 
          }}
        >
          {loading ? (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>กำลังโหลดโปรโมชัน...</p>
          ) : promotions.length > 0 ? (
            promotions.map((promo) => (
              <motion.div 
                key={promo._id}
                whileHover={{ scale: 1.02 }}
                style={{ 
                  backgroundColor: 'var(--bg-color)', 
                  borderRadius: '20px', 
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img 
                    src={`/image/${promo.imageUrl}`} 
                    alt={promo.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/image/2.jpg';
                    }}
                  />
                </div>
                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '10px' }}>{promo.title}</h3>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '20px', flex: 1, lineHeight: '1.6' }}>
                    {promo.discountDetails}
                  </p>
                  <div style={{ 
                    borderTop: '1px solid rgba(0,0,0,0.06)', 
                    paddingTop: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    <Calendar size={16} color="var(--accent)" />
                    <span>ระยะเวลา: {formatDate(promo.validFrom)} - {formatDate(promo.validUntil)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', border: '2px dashed rgba(31, 63, 47, 0.1)', borderRadius: '16px' }}>
              <Sparkles size={36} color="var(--accent)" style={{ marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>ขณะนี้ยังไม่มีโปรโมชันเพิ่มเติม โปรดติดตามข่าวสารเร็ว ๆ นี้!</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="gallery">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          บรรยากาศร้าน
        </motion.h2>
        
        <motion.div 
          className="gallery-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {galleries.length > 0 ? (
            galleries.map((item) => (
              <motion.div key={item._id} variants={fadeIn} className="gallery-item">
                <img 
                  src={`/image/${item.imageUrl}`} 
                  alt={item.title || "บรรยากาศร้าน"} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/image/2.jpg';
                  }}
                />
              </motion.div>
            ))
          ) : (
            [1, 2, 3, 4, 5, 6].map((num) => (
              <motion.div key={num} variants={fadeIn} className="gallery-item">
                <img src={`/image/${num}.jpg`} alt={`Gallery ${num}`} />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Videos & Articles Section */}
      <section id="contents" className="contents-section" style={{ padding: '80px 5%', backgroundColor: '#f9f9f9' }}>
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '10px' }}
        >
          วิดีโอ & บทความแนะนำ
        </motion.h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '50px', fontSize: '1rem' }}>
          บรรยากาศการบริการสปา วิดีโอรีวิวความประทับใจ และเกร็ดความรู้ดีๆ จาก เจริญศรีนวดแผนไทย
        </p>

        {contents.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>กำลังรออัปโหลดเนื้อหาจากแอดมินเร็วๆ นี้...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {contents.map((item) => {
              const ytId = item.videoUrl ? getYouTubeId(item.videoUrl) : null;
              const isFb = item.videoUrl && (item.videoUrl.includes('facebook.com') || item.videoUrl.includes('fb.watch'));
              return (
                <motion.div 
                  key={item._id}
                  whileHover={{ y: -8 }}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(31, 63, 47, 0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Card Header (Video Player or Image Cover) */}
                  <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#000', position: 'relative' }}>
                    {ytId ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${ytId}`} 
                        title={item.title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    ) : isFb && item.videoUrl ? (
                      <iframe 
                        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(item.videoUrl)}&show_text=0&width=360`} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none', overflow: 'hidden', width: '100%', height: '100%' }} 
                        scrolling="no" 
                        frameBorder="0" 
                        allowFullScreen={true} 
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      />
                    ) : (
                      <img 
                        src={`/image/${item.imageUrl}`} 
                        alt={item.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/image/2.jpg';
                        }}
                      />
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: '0 0 10px 0', fontWeight: '600' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 20px 0', lineHeight: '1.6', flex: 1 }}>
                      {item.description}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        👤 {item.author || 'Admin'}
                      </span>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '8px' }}
                        onClick={() => setSelectedArticle(item)}
                      >
                        อ่านเพิ่มเติม
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer / Contact Section */}
      <footer id="contact">
        <div className="footer-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '30px' }}>
          <div style={{ flex: 1.5, minWidth: '300px' }}>
            <div className="footer-brand">เจริญศรีนวดแผนไทย</div>
            <p style={{ fontStyle: 'italic', color: 'var(--accent)', marginTop: '5px' }}>"นวดถึงแผง แรงถึงใจ"</p>
            <p style={{ marginTop: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
              {shopInfo?.aboutUsText || 'ร้านไม่ได้เป็นเพียงสถานที่นวด แต่เป็นพื้นที่แห่งการพักผ่อน ที่ให้ความสำคัญกับสุขภาพกายและใจของลูกค้า'}
            </p>
            
            {/* Address */}
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '20px', color: 'rgba(255,255,255,0.8)' }}>
              <MapPin size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span>{shopInfo?.address || 'เดินทางสะดวก'}</span>
            </p>
          </div>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>ติดต่อเรา</h3>
            {shopInfo?.phone ? (
              shopInfo.phone.split(',').map((num, i) => (
                <p key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Phone size={18} color="var(--accent)" />
                  <a href={`tel:${num.trim()}`} style={{ color: 'white', hover: { color: 'var(--accent)' } }}>{num.trim()}</a>
                </p>
              ))
            ) : (
              <>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Phone size={18} color="var(--accent)" />
                  <a href="tel:094-358-2662" style={{ color: 'white' }}>094-358-2662</a>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Phone size={18} color="var(--accent)" />
                  <a href="tel:080-059-2451" style={{ color: 'white' }}>080-059-2451</a>
                </p>
              </>
            )}

            {shopInfo?.email && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Mail size={18} color="var(--accent)" />
                <a href={`mailto:${shopInfo.email}`} style={{ color: 'white' }}>{shopInfo.email}</a>
              </p>
            )}

            {/* Social Media Links */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {shopInfo?.socialLinks?.facebook && (
                <a 
                  href={formatUrl(shopInfo.socialLinks.facebook)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {shopInfo?.socialLinks?.instagram && (
                <a 
                  href={formatUrl(shopInfo.socialLinks.instagram)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
              )}
              {shopInfo?.socialLinks?.line && (
                <a 
                  href={formatUrl(shopInfo.socialLinks.line)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
              )}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>เวลาทำการ</h3>
            <p style={{ fontSize: '1.2rem', color: 'var(--accent)', fontWeight: 'bold' }}>เปิดให้บริการ</p>
            <p style={{ fontSize: '1.1rem', marginTop: '5px' }}>
              {shopInfo?.openingHours || 'ทุกวัน 09:00 – 20:30 น.'}
            </p>
          </div>
        </div>
        
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <span>&copy; {new Date().getFullYear()} เจริญศรีนวดแผนไทย สงวนลิขสิทธิ์</span>
          <Link to="/login" className="footer-admin-link">Admin Access</Link>
        </div>
      </footer>
      {selectedArticle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }} onClick={() => setSelectedArticle(null)}>
          <div className="glass" style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative',
            color: 'var(--text-main)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => setSelectedArticle(null)}
            >
              <X size={24} />
            </button>
            
            {selectedArticle.imageUrl && (
              <div style={{ height: '240px', overflow: 'hidden', borderRadius: '12px', marginBottom: '20px' }}>
                <img 
                  src={`/image/${selectedArticle.imageUrl}`} 
                  alt={selectedArticle.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/image/2.jpg';
                  }}
                />
              </div>
            )}
            
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '10px' }}>{selectedArticle.title}</h3>
            
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <span>✍️ ผู้เขียน: {selectedArticle.author || 'Admin'}</span>
              <span>📅 เผยแพร่เมื่อ: {new Date(selectedArticle.publishedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            
            <p style={{ fontWeight: '500', color: 'var(--primary-light)', marginBottom: '15px', fontSize: '1.05rem', lineHeight: '1.6' }}>
              {selectedArticle.description}
            </p>
            
            <div style={{ lineHeight: '1.7', color: '#444', whiteSpace: 'pre-line' }}>
              {selectedArticle.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
