import { API_URL } from '../../config';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Briefcase } from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  bio: string;
  profileImageUrl: string;
  experienceYears: number;
  isActive: boolean;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('2.jpg');
  const [experienceYears, setExperienceYears] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doctors`);
      const data = await res.json();
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
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
          setProfileImageUrl(data.filename);
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
    setEditingDoctor(null);
    setName('');
    setSpecialty('');
    setBio('');
    setProfileImageUrl('2.jpg');
    setExperienceYears('');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setSpecialty(doc.specialty);
    setBio(doc.bio);
    setProfileImageUrl(doc.profileImageUrl || '2.jpg');
    setExperienceYears(doc.experienceYears !== undefined ? String(doc.experienceYears) : '');
    setIsActive(doc.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const bodyData = {
      name,
      specialty,
      bio,
      profileImageUrl,
      experienceYears: Number(experienceYears) || 0,
      isActive
    };

    try {
      let res;
      if (editingDoctor) {
        res = await fetch(`${API_URL}/api/doctors/${editingDoctor._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      } else {
        res = await fetch(`${API_URL}/api/doctors`, {
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
        showToast(editingDoctor ? 'แก้ไขข้อมูลพนักงานสำเร็จ!' : 'เพิ่มข้อมูลพนักงานสำเร็จ!');
        setShowModal(false);
        fetchDoctors();
      } else {
        showToast('เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงานท่านนี้?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchDoctors();
        showToast('ลบข้อมูลพนักงานสำเร็จ!');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleToggleActive = async (doc: Doctor) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/doctors/${doc._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !doc.isActive })
      });
      const data = await res.json();
      if (data.success) {
        fetchDoctors();
        showToast('อัปเดตสถานะการทำงานสำเร็จ!');
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
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>จัดการพนักงาน / หมอนวดแผนไทย</h2>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          เพิ่มพนักงานใหม่
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
                <th>ชื่อ-นามสกุล</th>
                <th>ความชำนาญการ</th>
                <th>ประสบการณ์</th>
                <th>สถานะการทำงาน</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id}>
                  <td data-label="รูปภาพ">
                    <img 
                      src={`/image/${doc.profileImageUrl}`} 
                      alt={doc.name} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--accent)' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/image/2.jpg';
                      }}
                    />
                  </td>
                  <td data-label="ชื่อ-นามสกุล" style={{ fontWeight: '600' }}>{doc.name}</td>
                  <td data-label="ความชำนาญการ">{doc.specialty}</td>
                  <td data-label="ประสบการณ์">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <Briefcase size={14} />
                      <span>{doc.experienceYears} ปี</span>
                    </div>
                  </td>
                  <td data-label="สถานะการทำงาน">
                    <button 
                      onClick={() => handleToggleActive(doc)}
                      className={`action-btn ${doc.isActive ? 'active-status-btn' : 'inactive-status-btn'}`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: doc.isActive ? '#E6F4EA' : '#FCE8E6',
                        color: doc.isActive ? '#137333' : '#C5221F',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {doc.isActive ? <Check size={12} /> : <X size={12} />}
                      {doc.isActive ? 'ปฏิบัติงานอยู่' : 'พักงาน/ลาออก'}
                    </button>
                  </td>
                  <td data-label="จัดการ">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(doc)} className="action-btn edit-btn" style={{ backgroundColor: '#E8F0FE', color: '#1A73E8' }}>
                        <Edit2 size={14} /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(doc._id)} className="action-btn delete-btn">
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    ยังไม่มีข้อมูลพนักงานในระบบ กรุณากดปุ่มเพิ่มพนักงานใหม่
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
              {editingDoctor ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
            </h3>

            <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: '15px' }}>
              <div className="form-group">
                <label>ชื่อ-นามสกุลพนักงาน</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>ความชำนาญการ (เช่น นวดตอกเส้น, นวดน้ำมันอโรม่า)</label>
                <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>ประสบการณ์ทำงาน (ปี)</label>
                <input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>ประวัติย่อ / รายละเอียดเพิ่มเติม</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>อัปโหลดรูปภาพพนักงาน</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: '8px' }} />
              </div>

              <div className="form-group">
                <label>ชื่อไฟล์รูปภาพโปรไฟล์ (อัปเดตอัตโนมัติเมื่อเลือกไฟล์)</label>
                <input type="text" value={profileImageUrl} onChange={e => setProfileImageUrl(e.target.value)} required />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>เปิดสถานะพร้อมปฏิบัติงานทันที</label>
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

export default AdminDoctors;
