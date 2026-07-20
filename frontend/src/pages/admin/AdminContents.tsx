import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Check, X, User } from 'lucide-react';

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

const AdminContents = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('2.jpg');
  const [author, setAuthor] = useState('Admin');
  const [isActive, setIsActive] = useState(true);
  const [publishedAt, setPublishedAt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/contents');
      const data = await res.json();
      if (data.success) {
        setContents(data.data);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
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
    setEditingContent(null);
    setTitle('');
    setDescription('');
    setBody('');
    setImageUrl('2.jpg');
    setVideoUrl('');
    setAuthor('Admin');
    setIsActive(true);
    setPublishedAt(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const openEditModal = (content: ContentItem) => {
    setEditingContent(content);
    setTitle(content.title);
    setDescription(content.description);
    setBody(content.body);
    setImageUrl(content.imageUrl || '2.jpg');
    setVideoUrl(content.videoUrl || '');
    setAuthor(content.author || 'Admin');
    setIsActive(content.isActive);
    setPublishedAt(content.publishedAt ? content.publishedAt.split('T')[0] : '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const bodyData = {
      title,
      description,
      body,
      imageUrl,
      videoUrl,
      author,
      isActive,
      publishedAt
    };

    try {
      let res;
      if (editingContent) {
        res = await fetch(`http://localhost:5001/api/contents/${editingContent._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      } else {
        res = await fetch('http://localhost:5001/api/contents', {
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
        showToast(editingContent ? 'แก้ไขบทความสำเร็จ!' : 'สร้างบทความสำเร็จ!');
        setShowModal(false);
        fetchContents();
      } else {
        showToast('เกิดข้อผิดพลาด: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5001/api/contents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchContents();
        showToast('ลบบทความสำเร็จ!');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleToggleActive = async (content: ContentItem) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5001/api/contents/${content._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !content.isActive })
      });
      const data = await res.json();
      if (data.success) {
        fetchContents();
        showToast('อัปเดตสถานะบทความแล้ว!');
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
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>จัดการบทความและข่าวสาร</h2>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          เขียนบทความใหม่
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
                <th>หัวข้อบทความ</th>
                <th>คำอธิบายย่อ</th>
                <th>ผู้เขียน / วันที่เผยแพร่</th>
                <th>สถานะการใช้งาน</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((item) => (
                <tr key={item._id}>
                  <td data-label="รูปภาพ">
                    <img 
                      src={`/image/${item.imageUrl}`} 
                      alt={item.title} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/image/2.jpg';
                      }}
                    />
                  </td>
                  <td data-label="หัวข้อบทความ" style={{ fontWeight: '600', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.title}
                      {item.videoUrl && (
                        <span style={{ 
                          backgroundColor: '#E8F0FE', 
                          color: '#1A73E8', 
                          fontSize: '0.7rem', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}>
                          🎥 วิดีโอ
                        </span>
                      )}
                    </div>
                  </td>
                  <td data-label="คำอธิบายย่อ" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                  <td data-label="ผู้เขียน / วันที่เผยแพร่">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} /> {item.author}
                      </span>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {formatDate(item.publishedAt)}
                      </span>
                    </div>
                  </td>
                  <td data-label="สถานะการใช้งาน">
                    <button 
                      onClick={() => handleToggleActive(item)}
                      className={`action-btn ${item.isActive ? 'active-status-btn' : 'inactive-status-btn'}`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: item.isActive ? '#E6F4EA' : '#FCE8E6',
                        color: item.isActive ? '#137333' : '#C5221F',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {item.isActive ? <Check size={12} /> : <X size={12} />}
                      {item.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </button>
                  </td>
                  <td data-label="จัดการ">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(item)} className="action-btn edit-btn" style={{ backgroundColor: '#E8F0FE', color: '#1A73E8' }}>
                        <Edit2 size={14} /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="action-btn delete-btn">
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contents.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    ยังไม่มีบทความในระบบ กรุณากดปุ่มเพื่อเขียนบทความใหม่
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
            maxWidth: '650px',
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
              {editingContent ? 'แก้ไขข้อมูลบทความ' : 'เขียนบทความใหม่'}
            </h3>

            <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: '15px' }}>
              <div className="form-group">
                <label>หัวข้อบทความ</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>คำอธิบายย่อ (เพื่อแสดงบนการ์ดข่าวสาร)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>เนื้อหาบทความ (Body)</label>
                <textarea rows={8} value={body} onChange={e => setBody(e.target.value)} required style={{ fontSize: '0.95rem', lineHeight: '1.5' }} />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>ผู้เขียน</label>
                  <input type="text" value={author} onChange={e => setAuthor(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>วันที่เผยแพร่</label>
                  <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>อัปโหลดรูปภาพใหม่</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: '8px' }} />
              </div>

              <div className="form-group">
                <label>ชื่อไฟล์รูปภาพปก (อัปเดตอัตโนมัติเมื่อเลือกไฟล์)</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>ลิงก์วิดีโอ (YouTube URL เช่น https://www.youtube.com/watch?v=...)</label>
                <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="เช่น https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>เผยแพร่บทความนี้ทันที</label>
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

export default AdminContents;
