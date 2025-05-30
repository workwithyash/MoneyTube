import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

interface VideoStats {
  totalVideos: number;
  totalStorage: number;
  recentUploads: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<VideoStats>({
    totalVideos: 0,
    totalStorage: 0,
    recentUploads: 0,
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
    // TODO: Fetch actual stats from backend
    setStats({
      totalVideos: 150,
      totalStorage: 750, // in GB
      recentUploads: 12,
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Videos</h3>
            <p className="stat-value">{stats.totalVideos}</p>
          </div>
          <div className="stat-card">
            <h3>Total Storage</h3>
            <p className="stat-value">{stats.totalStorage} GB</p>
          </div>
          <div className="stat-card">
            <h3>Recent Uploads</h3>
            <p className="stat-value">{stats.recentUploads}</p>
          </div>
        </div>

        <div className="management-section">
          <h2>Management Controls</h2>
          <div className="control-buttons">
            <button className="control-button">User Management</button>
            <button className="control-button">Video Overview</button>
            <button className="control-button">Content Moderation</button>
            <button className="control-button">System Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 