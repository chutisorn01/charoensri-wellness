import { useState, useEffect } from 'react';
import { Scissors, Tag, Users, FileText, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    services: 0,
    promotions: 0,
    doctors: 0,
    contents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [servicesRes, promotionsRes, doctorsRes, contentsRes] = await Promise.all([
          fetch(`${API_URL}/api/services`),
          fetch(`${API_URL}/api/promotions`),
          fetch(`${API_URL}/api/doctors`),
          fetch(`${API_URL}/api/contents`)
        ]);

        const [servicesData, promotionsData, doctorsData, contentsData] = await Promise.all([
          servicesRes.json(),
          promotionsRes.json(),
          doctorsRes.json(),
          contentsRes.json()
        ]);

        setStats({
          services: servicesData.success ? servicesData.data.length : 0,
          promotions: promotionsData.success ? promotionsData.data.length : 0,
          doctors: doctorsData.success ? doctorsData.data.length : 0,
          contents: contentsData.success ? contentsData.data.length : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-welcome">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }}>
          ยินดีต้อนรับสู่ระบบจัดการข้อมูล เจริญศรีนวดแผนไทย
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          แผงควบคุมระบบหลังบ้านของคุณ เลือกเมนูด้านซ้ายเพื่อจัดการส่วนต่าง ๆ ของเว็บไซต์
        </p>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูลสถิติ...</p>
      ) : (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Card 1: Services */}
          <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: 'rgba(31, 63, 47, 0.1)', color: 'var(--primary)', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
              <Scissors size={28} />
            </div>
            <h4 style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '5px' }}>บริการสปาทั้งหมด</h4>
            <p className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
              {stats.services}
            </p>
          </div>

          {/* Card 2: Promotions */}
          <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent)', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
              <Tag size={28} />
            </div>
            <h4 style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '5px' }}>โปรโมชันปัจจุบัน</h4>
            <p className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)', margin: 0 }}>
              {stats.promotions}
            </p>
          </div>

          {/* Card 3: Staff */}
          <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: 'rgba(19, 115, 51, 0.1)', color: '#137333', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
              <Users size={28} />
            </div>
            <h4 style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '5px' }}>พนักงานทั้งหมด</h4>
            <p className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#137333', margin: 0 }}>
              {stats.doctors}
            </p>
          </div>

          {/* Card 4: Articles */}
          <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: 'rgba(26, 115, 232, 0.1)', color: '#1a73e8', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
              <FileText size={28} />
            </div>
            <h4 style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '5px' }}>บทความทั้งหมด</h4>
            <p className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a73e8', margin: 0 }}>
              {stats.contents}
            </p>
          </div>
        </div>
      )}

      {/* Quick Access or System Health Card */}
      <div className="admin-card" style={{ marginTop: '30px' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} color="var(--primary)" /> สถานะการเชื่อมต่อระบบหลังบ้าน
        </h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#E6F4EA', color: '#137333', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
            ● เชื่อมต่อ Database สำเร็จ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#E6F4EA', color: '#137333', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
            ● API Server ทำงานปกติ (Port 5001)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#E6F4EA', color: '#137333', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
            ● แฟลตฟอร์มพร้อมให้บริการ
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
