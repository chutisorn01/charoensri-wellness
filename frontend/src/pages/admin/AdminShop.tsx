import { useState, useEffect } from 'react';
import { Save, Info, Phone, Mail, Clock } from 'lucide-react';

const AdminShop = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [aboutUsText, setAboutUsText] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [line, setLine] = useState('');
  
  // Highlights State
  const [hl1Title, setHl1Title] = useState('');
  const [hl1Desc, setHl1Desc] = useState('');
  const [hl2Title, setHl2Title] = useState('');
  const [hl2Desc, setHl2Desc] = useState('');
  const [hl3Title, setHl3Title] = useState('');
  const [hl3Desc, setHl3Desc] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    fetchShopInfo();
  }, []);

  const fetchShopInfo = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/shop');
      const data = await res.json();
      if (data.success && data.data) {
        const shop = data.data;
        setAboutUsText(shop.aboutUsText || '');
        setTagline(shop.tagline || '');
        setLogoUrl(shop.logoUrl || 'logo.JPG');
        setAddress(shop.address || '');
        setPhone(shop.phone || '');
        setEmail(shop.email || '');
        setOpeningHours(shop.openingHours || '');
        setFacebook(shop.socialLinks?.facebook || '');
        setInstagram(shop.socialLinks?.instagram || '');
        setLine(shop.socialLinks?.line || '');

        if (shop.highlights && shop.highlights.length >= 3) {
          setHl1Title(shop.highlights[0].title || '');
          setHl1Desc(shop.highlights[0].description || '');
          setHl2Title(shop.highlights[1].title || '');
          setHl2Desc(shop.highlights[1].description || '');
          setHl3Title(shop.highlights[2].title || '');
          setHl3Desc(shop.highlights[2].description || '');
        } else {
          // Defaults
          setHl1Title('นวดแผนไทยมาตรฐาน');
          setHl1Desc('ให้บริการนวดโดยผู้มีประสบการณ์ หมอนวดฝีมือดี ช่วยผ่อนคลายความเมื่อยล้าและฟื้นฟูร่างกาย');
          setHl2Title('สถานที่สะอาด บรรยากาศผ่อนคลาย');
          setHl2Desc('พื้นที่แห่งการพักผ่อน เงียบสงบ อบอุ่น เพื่อให้ลูกค้ารู้สึกผ่อนคลายตั้งแต่ก้าวแรกที่เข้ามา');
          setHl3Title('ใส่ใจทุกขั้นตอน');
          setHl3Desc('ดูแลลูกค้าอย่างใส่ใจ ให้บริการด้วยความเป็นมิตร เพื่อสุขภาพกายและใจที่ดีที่สุดของคุณ');
        }
      }
    } catch (error) {
      console.error('Error fetching shop info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);

    if (file.name.toLowerCase().endsWith('.heic')) {
      showToast('กำลังแปลงไฟล์รูปภาพ .HEIC เป็น .JPG กรุณารอสักครู่...', 'success');
      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        file = new File([blobToUse], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg'
        });
      } catch (err) {
        console.error('HEIC conversion error:', err);
        showToast('แปลงไฟล์ .HEIC ล้มเหลว กรุณาใช้ไฟล์ .JPG หรือ .PNG แทนครับ', 'error');
        setLogoUploading(false);
        return;
      }
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const token = localStorage.getItem('adminToken');
      
      try {
        const res = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: base64String,
            name: file.name
          })
        });
        
        const data = await res.json();
        if (data.success) {
          setLogoUrl(data.filename);
          showToast('อัปโหลดโลโก้ร้านสำเร็จ! อย่าลืมกดบันทึกข้อมูลเพื่อเปิดใช้งาน');
        } else {
          showToast('อัปโหลดล้มเหลว: ' + data.error, 'error');
        }
      } catch (err) {
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่ออัปโหลด', 'error');
      } finally {
        setLogoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('adminToken');

    const bodyData = {
      aboutUsText,
      tagline,
      logoUrl,
      address,
      phone,
      email,
      openingHours,
      socialLinks: {
        facebook,
        instagram,
        line
      },
      highlights: [
        { title: hl1Title, description: hl1Desc, iconType: 'leaf' },
        { title: hl2Title, description: hl2Desc, iconType: 'sparkles' },
        { title: hl3Title, description: hl3Desc, iconType: 'heart' }
      ]
    };

    try {
      const res = await fetch('http://localhost:5001/api/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (data.success) {
        showToast('บันทึกข้อมูลตั้งค่าร้านสำเร็จ!');
        fetchShopInfo();
      } else {
        showToast('เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}><p>กำลังโหลดข้อมูลการตั้งค่าร้าน...</p></div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0' }}>
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
      <div className="admin-header-actions" style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary)', fontWeight: '600' }}>ตั้งค่าข้อมูลร้านและช่องทางติดต่อ</h2>
        <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>จัดการรายละเอียดการติดต่อ ที่อยู่ และช่องทางโซเชียลมีเดียหลักของร้าน</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Section 1: ข้อมูลเกี่ยวกับร้านค้า */}
        <div className="shop-section">
          <div className="shop-section-info">
            <h4>ข้อมูลเกี่ยวกับร้านค้า</h4>
            <p>ระบุคำอธิบายความเป็นมา จุดเด่นของร้าน และที่ตั้งจริงของสถานบริการสปาเพื่อแสดงผลหน้าแรก</p>
          </div>
          <div className="shop-section-card">
            <div className="form-group" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={logoUrl === 'logo.JPG' || !logoUrl ? '/logo/logo.JPG' : `/image/${logoUrl}`} 
                  alt="Shop Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo/logo.JPG';
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '5px' }}>🖼️ โลโก้ของร้านค้า (Shop Logo)</label>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>รองรับไฟล์รูปภาพ JPEG, PNG, WEBP และ HEIC</p>
                <input 
                  type="file" 
                  accept="image/*,.heic" 
                  onChange={handleLogoUpload} 
                  disabled={logoUploading}
                  style={{ fontSize: '0.85rem' }}
                />
                {logoUploading && <span style={{ display: 'block', marginTop: '5px', fontSize: '0.8rem', color: 'var(--primary-light)' }}>กำลังอัปโหลดโลโก้...</span>}
              </div>
            </div>

            <div className="form-group">
              <label><Info size={15} /> รายละเอียดเกี่ยวกับเรา (About Us)</label>
              <textarea 
                rows={5} 
                value={aboutUsText} 
                onChange={e => setAboutUsText(e.target.value)} 
                placeholder="กรอกประวัติความเป็นมาและจุดเด่นของร้าน..."
                required 
              />
            </div>
            <div className="form-group">
              <label>💬 คำโปรย / คำคมประจำร้าน (Tagline)</label>
              <input 
                type="text" 
                value={tagline} 
                onChange={e => setTagline(e.target.value)} 
                placeholder="เช่น นวดถึงแผง แรงถึงใจ..."
                required 
              />
            </div>
            <div className="form-group">
              <label>📍 ที่ตั้งร้าน / ที่อยู่</label>
              <textarea 
                rows={3} 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder="กรอกที่อยู่สำหรับแสดงบนหน้าเว็บไซต์..."
                required 
              />
            </div>
          </div>
        </div>

        <hr className="shop-divider" />

        {/* Section 2: ข้อมูลติดต่อและเวลาทำการ */}
        <div className="shop-section">
          <div className="shop-section-info">
            <h4>ข้อมูลติดต่อและเวลาทำการ</h4>
            <p>กำหนดเบอร์โทรศัพท์ อีเมลการติดต่อ และวันเวลาทำการสปาสำหรับลูกค้า</p>
          </div>
          <div className="shop-section-card">
            <div className="form-row">
              <div className="form-group flex-1">
                <label><Phone size={15} /> เบอร์โทรศัพท์ติดต่อ</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="เช่น 094-358-2662"
                  required 
                />
              </div>
              <div className="form-group flex-1">
                <label><Mail size={15} /> อีเมล</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="เช่น contact@charoensriwellness.com"
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label><Clock size={15} /> เวลาทำการ</label>
              <input 
                type="text" 
                value={openingHours} 
                onChange={e => setOpeningHours(e.target.value)} 
                placeholder="เช่น เปิดทุกวัน 09:00 - 20:30 น."
                required 
              />
            </div>
          </div>
        </div>

        <hr className="shop-divider" />

        {/* Section 3: ลิงก์โซเชียลมีเดีย */}
        <div className="shop-section">
          <div className="shop-section-info">
            <h4>ลิงก์โซเชียลมีเดีย</h4>
            <p>เชื่อมต่อช่องทางติดต่อภายนอกของร้าน เพื่ออัปเดตไอคอนลิงก์บนแถบเมนูด้านล่างสุดของเว็บหลัก</p>
          </div>
          <div className="shop-section-card">
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="#1877F2" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                Facebook Page Link
              </label>
              <input 
                type="text" 
                value={facebook} 
                onChange={e => setFacebook(e.target.value)} 
                placeholder="เช่น https://facebook.com/charoensriwellness"
              />
            </div>
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="#E4405F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                Instagram URL
              </label>
              <input 
                type="text" 
                value={instagram} 
                onChange={e => setInstagram(e.target.value)} 
                placeholder="เช่น https://instagram.com/charoensriwellness"
              />
            </div>
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="#06C755" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Line OA ID / Link
              </label>
              <input 
                type="text" 
                value={line} 
                onChange={e => setLine(e.target.value)} 
                placeholder="เช่น @charoensri หรือ https://line.me/R/ti/p/..."
              />
            </div>
          </div>
        </div>

        <hr className="shop-divider" />

        {/* Section 4: จุดเด่นของร้านค้า */}
        <div className="shop-section">
          <div className="shop-section-info">
            <h4>จุดเด่นของร้านค้า</h4>
            <p>แก้ไขหัวข้อจุดเด่นและคำอธิบาย 3 หัวข้อหลักที่จะไปแสดงผลในส่วน "จุดเด่นของร้าน" หน้าแรก</p>
          </div>
          <div className="shop-section-card">
            
            {/* Highlight 1 */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
              <h5 style={{ margin: '0 0 12px 0', color: 'var(--primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                🍃 จุดเด่นที่ 1 (ไอคอนใบไม้)
              </h5>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>หัวข้อจุดเด่น</label>
                <input 
                  type="text" 
                  value={hl1Title} 
                  onChange={e => setHl1Title(e.target.value)} 
                  placeholder="เช่น นวดแผนไทยมาตรฐาน"
                  required
                />
              </div>
              <div className="form-group">
                <label>รายละเอียดคำอธิบาย</label>
                <textarea 
                  rows={2} 
                  value={hl1Desc} 
                  onChange={e => setHl1Desc(e.target.value)} 
                  placeholder="คำอธิบายสั้นๆ..."
                  required
                />
              </div>
            </div>

            {/* Highlight 2 */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', paddingTop: '10px' }}>
              <h5 style={{ margin: '0 0 12px 0', color: 'var(--primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                ✨ จุดเด่นที่ 2 (ไอคอนวิบวับ)
              </h5>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>หัวข้อจุดเด่น</label>
                <input 
                  type="text" 
                  value={hl2Title} 
                  onChange={e => setHl2Title(e.target.value)} 
                  placeholder="เช่น สถานที่สะอาด บรรยากาศผ่อนคลาย"
                  required
                />
              </div>
              <div className="form-group">
                <label>รายละเอียดคำอธิบาย</label>
                <textarea 
                  rows={2} 
                  value={hl2Desc} 
                  onChange={e => setHl2Desc(e.target.value)} 
                  placeholder="คำอธิบายสั้นๆ..."
                  required
                />
              </div>
            </div>

            {/* Highlight 3 */}
            <div style={{ paddingTop: '10px' }}>
              <h5 style={{ margin: '0 0 12px 0', color: 'var(--primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                ❤️ จุดเด่นที่ 3 (ไอคอนหัวใจ)
              </h5>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>หัวข้อจุดเด่น</label>
                <input 
                  type="text" 
                  value={hl3Title} 
                  onChange={e => setHl3Title(e.target.value)} 
                  placeholder="เช่น ใส่ใจทุกขั้นตอน"
                  required
                />
              </div>
              <div className="form-group">
                <label>รายละเอียดคำอธิบาย</label>
                <textarea 
                  rows={2} 
                  value={hl3Desc} 
                  onChange={e => setHl3Desc(e.target.value)} 
                  placeholder="คำอธิบายสั้นๆ..."
                  required
                />
              </div>
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '25px', marginBottom: '60px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 30px', 
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(31, 63, 47, 0.15)'
            }}
          >
            <Save size={18} />
            {saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลตั้งค่าทั้งหมด'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminShop;
