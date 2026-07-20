import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  isActive: boolean;
}

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
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
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
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
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('');
    setDuration('');
    setImageUrl('2.jpg');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setPrice(String(service.price));
    setDuration(String(service.durationMinutes));
    setImageUrl(service.imageUrl || '1.jpg');
    setIsActive(service.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const bodyData = {
      name,
      description,
      price: Number(price),
      durationMinutes: Number(duration),
      imageUrl,
      isActive
    };

    try {
      let res;
      if (editingService) {
        res = await fetch(`http://localhost:5001/api/services/${editingService._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      } else {
        res = await fetch('http://localhost:5001/api/services', {
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
        showToast(editingService ? 'แก้ไขข้อมูลบริการสำเร็จ!' : 'เพิ่มข้อมูลบริการสำเร็จ!');
        setShowModal(false);
        fetchServices();
      } else {
        showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบริการนี้?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5001/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchServices();
        showToast('ลบข้อมูลบริการสำเร็จ!');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleToggleActive = async (service: Service) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5001/api/services/${service._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !service.isActive })
      });
      const data = await res.json();
      if (data.success) {
        fetchServices();
        showToast('อัปเดตสถานะให้บริการแล้ว!');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  return (
    <div>
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>จัดการบริการสปา</h2>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          เพิ่มบริการใหม่
        </button>
      </div>

      {/* Data Table */}
      <div className="admin-card">
        {loading ? <p>กำลังโหลดข้อมูล...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>รูปภาพ</th>
                <th>ชื่อบริการ</th>
                <th>ราคา</th>
                <th>ระยะเวลา</th>
                <th>สถานะให้บริการ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service._id}>
                  <td data-label="รูปภาพ">
                    <img 
                      src={`/image/${service.imageUrl}`} 
                      alt={service.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/image/2.jpg';
                      }}
                    />
                  </td>
                  <td data-label="ชื่อบริการ" style={{ fontWeight: '600' }}>{service.name}</td>
                  <td data-label="ราคา">{service.price} ฿</td>
                  <td data-label="ระยะเวลา">{service.durationMinutes} นาที</td>
                  <td data-label="สถานะให้บริการ">
                    <button 
                      onClick={() => handleToggleActive(service)}
                      className={`action-btn ${service.isActive ? 'active-status-btn' : 'inactive-status-btn'}`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: service.isActive ? '#E6F4EA' : '#FCE8E6',
                        color: service.isActive ? '#137333' : '#C5221F',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {service.isActive ? <Check size={12} /> : <X size={12} />}
                      {service.isActive ? 'เปิดให้บริการ' : 'ปิดให้บริการ'}
                    </button>
                  </td>
                  <td data-label="จัดการ">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(service)} className="action-btn edit-btn" style={{ backgroundColor: '#E8F0FE', color: '#1A73E8' }}>
                        <Edit2 size={14} /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(service._id)} className="action-btn delete-btn">
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    ยังไม่มีข้อมูลบริการในระบบ กรุณากดปุ่มเพิ่มบริการใหม่
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
              {editingService ? 'แก้ไขข้อมูลบริการสปา' : 'เพิ่มบริการสปาใหม่'}
            </h3>

            <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: '15px' }}>
              <div className="form-group">
                <label>ชื่อบริการ</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>รายละเอียดบริการ</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>ราคา (บาท)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>ระยะเวลา (นาที)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
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
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>เปิดให้บริการทันที</label>
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

export default AdminServices;
