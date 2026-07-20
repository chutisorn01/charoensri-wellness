import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminContents from './pages/admin/AdminContents';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminShop from './pages/admin/AdminShop';
import AdminGallery from './pages/admin/AdminGallery';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="contents" element={<AdminContents />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="shop" element={<AdminShop />} />
            <Route path="gallery" element={<AdminGallery />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
