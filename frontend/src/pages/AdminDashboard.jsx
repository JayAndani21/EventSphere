import { useState } from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  BarChart3,
  FileText,
  LayoutDashboard,
  Bell,
  ChevronDown
} from 'lucide-react';
import '../styles/AdminDashboard.css';
import UserManagement from './Adminsections/UserManagement';
import OrganizerManagement from './Adminsections/OrganizerManagement';
import PendingEvents from './Adminsections/PendingEvents';
import PublishedEvents from './Adminsections/PublishedEvents';
import Analytics from './Adminsections/Analytics';
import SystemLogs from './Adminsections/SystemLogs';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0); // You can manually set count for testing

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'organizers':
        return <OrganizerManagement />;
      case 'pending-events':
        return <PendingEvents />;
      case 'published-events':
        return <PublishedEvents />;
      case 'analytics':
        return <Analytics />;
      case 'system-logs':
        return <SystemLogs />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <LayoutDashboard size={28} />
            <span>Admin Portal</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div
            className={`sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionChange('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => handleSectionChange('users')}
          >
            <Users size={20} />
            <span>Users</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'organizers' ? 'active' : ''}`}
            onClick={() => handleSectionChange('organizers')}
          >
            <Briefcase size={20} />
            <span>Organizers</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'pending-events' ? 'active' : ''}`}
            onClick={() => handleSectionChange('pending-events')}
          >
            <Calendar size={20} />
            <span>Pending Events</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'published-events' ? 'active' : ''}`}
            onClick={() => handleSectionChange('published-events')}
          >
            <CheckCircle size={20} />
            <span>Published Events</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => handleSectionChange('analytics')}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'system-logs' ? 'active' : ''}`}
            onClick={() => handleSectionChange('system-logs')}
          >
            <FileText size={20} />
            <span>System Logs</span>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {/* <header className="header">
          <h1 className="header-title">Event Management System</h1>
          <div className="header-actions">
            <div className="notification-icon" onClick={() => handleSectionChange('pending-events')}>
              <Bell size={24} />
              {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
            </div>
            <div className="profile-dropdown">
              <div className="profile-button">
                <div className="profile-avatar">A</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Admin User</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Administrator</div>
                </div>
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
        </header> */}

        <div className="content-area">{renderContent()}</div>
      </main>
    </div>
  );
};

const DashboardOverview = () => {
  // Hardcoded stats for UI demo
  const stats = {
    totalUsers: 120,
    totalOrganizers: 25,
    pendingEvents: 5,
    publishedEvents: 30,
    totalTickets: 450
  };

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#2D1B4E' }}>
        Dashboard Overview
      </h2>
      <div className="stats-grid">
        <div className="stat-card">
          <Users className="stat-icon" size={32} />
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <Briefcase className="stat-icon" size={32} />
          <div className="stat-label">Total Organizers</div>
          <div className="stat-value">{stats.totalOrganizers}</div>
        </div>
        <div className="stat-card">
          <Calendar className="stat-icon" size={32} />
          <div className="stat-label">Pending Events</div>
          <div className="stat-value">{stats.pendingEvents}</div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" size={32} />
          <div className="stat-label">Published Events</div>
          <div className="stat-value">{stats.publishedEvents}</div>
        </div>
        <div className="stat-card">
          <FileText className="stat-icon" size={32} />
          <div className="stat-label">Total Tickets Issued</div>
          <div className="stat-value">{stats.totalTickets}</div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          <button className="a-btn btn-primary">
            <Users size={16} />
            View All Users
          </button>
          <button className="btn btn-primary">
            <Calendar size={16} />
            Review Pending Events
          </button>
          <button className="btn btn-primary">
            <BarChart3 size={16} />
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
