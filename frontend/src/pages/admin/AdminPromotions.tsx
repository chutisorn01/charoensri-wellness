import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Check, X } from 'lucide-react';

interface Promotion {
  _id: string;
  title: string;
  discountDetails: string;
  imageUrl: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [discountDetails, setDiscountDetails] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [imageUrl, setImageUrl] = useState('2.jpg');
  const [isActive, setIsActive] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/promotions`);
      const data = await res.json();
      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

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
          showToast('อัปโหลดรูปภาพสำเร็จ!');
        } else {
          showToast('อัปโหลดล้มเหลว: ' + data.error, 'error');
        }
      } catch (err) {
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่ออัปโหลด', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingPromo(null);
    setTitle('');
    setDiscountDetails('');
    // Default dates: today and one month from today
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    setValidFrom(today);
    setValidUntil(nextMonthStr);
    setImageUrl('2.jpg');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromo(promo);
    setTitle(promo.title);
    setDiscountDetails(promo.discountDetails);
    setValidFrom(promo.validFrom ? promo.validFrom.split('T')[0] : '');
    setValidUntil(promo.validUntil ? promo.validUntil.split('T')[0] : '');
    setImageUrl(promo.imageUrl || '2.jpg');
    setIsActive(promo.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const bodyData = {
      title,
      discountDetails,
      validFrom,
      validUntil,
      imageUrl,
      isActive
    };

    try {
      let res;
      if (editingPromo) {
        res = await fetch(`${API_URL}/api/promotions/${editingPromo._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      } else {
        res = await fetch(`${API_URL}/api/promotions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(editingPromo ? 'แก้ไขข้อมูลโปรโมชันสำเร็จ!' : 'เพิ่มโปรโมชันสำเร็จ!');
        setShowModal(false);
        fetchPromotions();
      } else {
        showToast('เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชันนี้?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchPromotions();
        showToast('ลบโปรโมชันสำเร็จ!');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/promotions/${promo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !promo.isActive })
      });
      const data = await res.json();
      if (data.success) {
        fetchPromotions();
        showToast('อัปเดตสถานะโปรโมชันแล้ว!');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>จัดการโปรโมชันสปา</h2>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          เพิ่มโปรโมชันใหม่
        </button>
      </div>

      {/* Table Card */}
      <div className="admin-card">
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>รูปภาพ</th>
                <th>ชื่อโปรโมชัน</th>
                <th>รายละเอียดส่วนลด</th>
                <th>ระยะเวลาโปรโมชัน</th>
                <th>สถานะการใช้งาน</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo._id}>
                  <td data-label="รูปภาพ">
                    <img 
                      src={`/image/${promo.imageUrl}`} 
                      alt={promo.title} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/image/2.jpg';
                      }}
                    />
                  </td>
                  <td data-label="ชื่อโปรโมชัน" style={{ fontWeight: '600' }}>{promo.title}</td>
                  <td data-label="รายละเอียดส่วนลด">{promo.discountDetails}</td>
                  <td data-label="ระยะเวลาโปรโมชัน">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      <span>{formatDate(promo.validFrom)} - {formatDate(promo.validUntil)}</span>
                    </div>
                  </td>
                  <td data-label="สถานะการใช้งาน">
                    <button 
                      onClick={() => handleToggleActive(promo)}
                      className={`action-btn ${promo.isActive ? 'active-status-btn' : 'inactive-status-btn'}`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: promo.isActive ? '#E6F4EA' : '#FCE8E6',
                        color: promo.isActive ? '#137333' : '#C5221F',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {promo.isActive ? <Check size={12} /> : <X size={12} />}
                      {promo.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </button>
                  </td>
                  <td data-label="จัดการ">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(promo)} className="action-btn edit-btn" style={{ backgroundColor: '#E8F0FE', color: '#1A73E8' }}>
                        <Edit2 size={14} /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(promo._id)} className="action-btn delete-btn">
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    ยังไม่มีข้อมูลโปรโมชันในระบบ กรุณากดปุ่มเพิ่มโปรโมชันใหม่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content admin-card" style={{
            width: '100%',
            maxWidth: '550px',
            margin: '20px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', color: 'var(--primary)' }}>
              {editingPromo ? 'แก้ไขข้อมูลโปรโมชัน' : 'เพิ่มโปรโมชันใหม่'}
            </h3>

            <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: '15px' }}>
              <div className="form-group">
                <label>ชื่อโปรโมชัน</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>รายละเอียดส่วนลด / สิทธิประโยชน์</label>
                <textarea rows={3} value={discountDetails} onChange={e => setDiscountDetails(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>เริ่มโปรโมชันวันที่</label>
                  <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>หมดเขตวันที่</label>
                  <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>อัปโหลดรูปภาพใหม่</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: '8px' }} />
              </div>

              <div className="form-group">
                <label>ชื่อไฟล์รูปภาพ (อัปเดตอัตโนมัติเมื่อเลือกไฟล์)</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>เปิดใช้งานโปรโมชันนี้ทันที</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
