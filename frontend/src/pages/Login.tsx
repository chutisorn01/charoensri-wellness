import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setSuccessMsg('Login Successful! Welcome Admin.');
        setTimeout(() => {
          navigate('/admin');
        }, 1800);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <img src="/image/bg.PNG" alt="Background" className="hero-bg" />
      <div className="hero-overlay"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-container glass"
      >
        <div className="login-header">
          <img src="/logo/logo.JPG" alt="Logo" className="nav-logo mx-auto mb-4" style={{ width: '60px', height: '60px' }} />
          <h2>Admin Access</h2>
          <p>Charoensri Wellness Management</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter username" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/" className="back-link">← Back to Website</Link>
        </div>
      </motion.div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '40px 30px',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}
          >
            {/* Animated Checkmark Circle */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e6f4ea',
              color: '#137333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px rgba(19, 115, 51, 0.15)'
            }}>
              <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h3 style={{ fontSize: '1.6rem', color: '#137333', margin: '0 0 10px 0', fontWeight: '700' }}>
              เข้าสู่ระบบสำเร็จ!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 5px 0' }}>
              ยินดีต้อนรับแอดมินเจริญศรีสปา
            </p>
            <div style={{ fontSize: '0.85rem', color: '#137333', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: 16, height: 16, border: '2px solid rgba(19,115,51,0.2)', borderTopColor: '#137333', borderRadius: '50%' }} 
              />
              กำลังเปิดหน้าแดชบอร์ด...
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Login;
