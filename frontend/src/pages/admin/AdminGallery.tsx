import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Camera, X } from 'lucide-react';

interface GalleryItem {
  _id: string;
  imageUrl: string;
  title: string;
  isActive: boolean;
}

const AdminGallery = () => {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gallery`);
      const data = await res.json();
      if (data.success) {
        setGalleries(data.data);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

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
        setUploading(false);
        return;
      }
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const token = localStorage.getItem('adminToken');
      
      try {
        const res = await fetch(`${API_URL}/api/upload`, {
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
          setImageUrl(data.filename);
          showToast('อัปโหลดไฟล์รูปภาพสำเร็จ!');
        } else {
          showToast('อัปโหลดล้มเหลว: ' + data.error, 'error');
        }
      } catch (err) {
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่ออัปโหลด', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      showToast('กรุณาเลือกและอัปโหลดรูปภาพก่อนบันทึก', 'error');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`${API_URL}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl,
          title,
          isActive: true
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('บันทึกรูปภาพบรรยากาศร้านใหม่สำเร็จ!');
        setTitle('');
        setImageUrl('');
        fetchGalleries();
      } else {
        showToast('เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบรูปภาพบรรยากาศนี้ใช่หรือไม่?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        showToast('ลบรูปภาพแกลเลอรีสำเร็จ!');
        fetchGalleries();
      } else {
        showToast('เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="admin-header-actions" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>จัดการแกลเลอรี / บรรยากาศร้าน</h2>
        <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>เพิ่มและลบรูปภาพบรรยากาศร้านสปาที่จะไปแสดงในส่วน "บรรยากาศร้าน" หน้าแรกของเว็บไซต์</p>
      </div>

      {/* Upload Form Card */}
      <div className="shop-section-card" style={{ marginBottom: '30px', padding: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={18} /> เพิ่มรูปภาพบรรยากาศใหม่
        </h3>
        
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '280px' }}>
              <label>เลือกไฟล์รูปภาพ (JPG, PNG, WEBP, HEIC)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{ padding: '10px', marginTop: '5px', width: '100%' }} 
                disabled={uploading || saving}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1.5, minWidth: '280px' }}>
              <label>คำอธิบายรูปภาพ (แสดงเมื่อลูกค้ากดดูรูป หรือเอาเมาส์ชี้)</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="เช่น ห้องสปาส่วนตัว, อ่างแช่สมุนไพร, โซนต้อนรับ..." 
                disabled={uploading || saving}
                style={{ width: '100%', marginTop: '5px' }}
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={uploading || saving || !imageUrl}
                style={{ 
                  height: '48px', 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(31, 63, 47, 0.15)'
                }}
              >
                <Plus size={18} />
                {saving ? 'กำลังบันทึก...' : 'เพิ่มลงแกลเลอรี'}
              </button>
            </div>
          </div>
          
          {imageUrl && (
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>ดูตัวอย่างรูปภาพที่จะเพิ่ม:</span>
              <div style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                <img src={`/image/${imageUrl}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')}
                  style={{ position: 'absolute', top: '2px', right: '2px', padding: '2px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <X size={12} color="#c62828" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px 0' }}>กำลังโหลดรูปภาพแกลเลอรี...</p>
      ) : galleries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>ไม่มีรูปภาพในแกลเลอรีขณะนี้ อัปโหลดรูปภาพใหม่ที่กล่องด้านบนเพื่อเปิดใช้งาน</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          {galleries.map((item) => (
            <div 
              key={item._id} 
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.02)',
                aspectRatio: '3/2',
                backgroundColor: '#f5f5f5',
                group: 'true' // styling placeholder
              }}
            >
              <img 
                src={`/image/${item.imageUrl}`} 
                alt={item.title || 'Gallery Photo'} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              
              {/* Overlay with Title and Actions */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}>
                <span style={{ color: 'white', fontSize: '0.88rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                  {item.title || 'ไม่มีคำอธิบาย'}
                </span>
                
                <button 
                  onClick={() => handleDelete(item._id)}
                  style={{
                    background: '#fbebe9',
                    color: '#c62828',
                    border: '1px solid rgba(198,40,40,0.1)',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title="ลบรูปภาพนี้"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
