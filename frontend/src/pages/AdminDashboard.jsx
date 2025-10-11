import { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  BarChart3,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import '../styles/AdminDashboard.css';
import UserManagement from './Adminsections/UserManagement';
import OrganizerManagement from './Adminsections/OrganizerManagement';
import PendingEvents from './Adminsections/PendingEvents';
import PublishedEvents from './Adminsections/PublishedEvents';
import Analytics from './Adminsections/Analytics';
// import SystemLogs from './Adminsections/SystemLogs';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

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
          {/* <div
            className={`sidebar-item ${activeSection === 'system-logs' ? 'active' : ''}`}
            onClick={() => handleSectionChange('system-logs')}
          >
            <FileText size={20} />
            <span>System Logs</span>
          </div> */}
        </nav>
      </aside>

      <main className="main-content">
        <div className="content-area">{renderContent()}</div>
      </main>
    </div>
  );
};

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalAttendees: 0,
    pendingEvents: 0,
    publishedEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user/organizer/attendee stats
        const res = await fetch('http://localhost:5000/api/auth/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer admin-token', // Replace with actual token
          },
        });

        const data = await res.json();
        if (!data.success) throw new Error('Failed to fetch stats');

        // Fetch all events
        const eventRes = await fetch('http://localhost:5000/api/events/all');
        const eventData = await eventRes.json();

        const pendingEvents = eventData.data.filter((e) => e.status === 'draft').length;
        const publishedEvents = eventData.data.filter((e) => e.status === 'published' || 'completed').length;

        setStats({
          totalUsers: data.data.totalUsers,
          totalOrganizers: data.data.totalOrganizers,
          totalAttendees: data.data.totalAttendees,
          pendingEvents,
          publishedEvents,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

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
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{stats.publishedEvents}</div>
        </div>
        <div className="stat-card">
          <FileText className="stat-icon" size={32} />
          <div className="stat-label">Total Attendees</div>
          <div className="stat-value">{stats.totalAttendees}</div>
        </div>
      </div>
      <div className="section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          <button className="a-btn btn-primary"> <Users size={16} /> View All Users </button>
          <button className="btn btn-primary"> <Calendar size={16} /> Review Pending Events </button>
          <button className="btn btn-primary"> <BarChart3 size={16} /> View Analytics </button>
        </div>
      </div>
    </div>


  );
};

export default AdminDashboard;
