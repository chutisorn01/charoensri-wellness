import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scissors, Tag, FileText, Users, Settings, LogOut, Menu, X, Camera } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', name: 'หน้าแรก', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/services', name: 'จัดการบริการสปา', icon: <Scissors size={20} /> },
    { path: '/admin/promotions', name: 'จัดการโปรโมชัน', icon: <Tag size={20} /> },
    { path: '/admin/contents', name: 'จัดการบทความ', icon: <FileText size={20} /> },
    { path: '/admin/gallery', name: 'จัดการแกลเลอรี', icon: <Camera size={20} /> },
    { path: '/admin/doctors', name: 'จัดการพนักงาน', icon: <Users size={20} /> },
    { path: '/admin/shop', name: 'ตั้งค่าร้าน', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar Overlay Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo/logo.JPG" alt="Logo" className="sidebar-logo" />
          <h3>ระบบหลังบ้าน</h3>
          <button 
            type="button"
            className="sidebar-close-btn" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              type="button"
              className="hamburger-btn" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="admin-header-title">ระบบจัดการข้อมูล เจริญศรีนวดแผนไทย</h2>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
