import { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, Ticket } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    activeOrganizers: 0,
    averageAttendance: 0,
    eventsByType: {},
    topOrganizers: []
  });

  const eventTypeColors = {
    conference: '#7C6BA5',
    workshop: '#A084FF',
    contest: '#D9B3FF',
    seminar: '#E0CFFF',
    other: '#5A4E7C'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all events
        const eventsRes = await axios.get('http://localhost:5000/api/events/all');
        const events = eventsRes.data.data;

        // Fetch all users
        const usersRes = await axios.get('http://localhost:5000/api/auth/usersdata', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer admin-token`
          }
        });
        const users = usersRes.data.data;

        // Fetch all contests
        const contestsRes = await axios.get('http://localhost:5000/api/contests/');
        const contests = contestsRes.data.contests;

        // Compute stats
        const totalEvents = events.length + contests.length;
        const totalTickets = events.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);
        const activeOrganizers = users.filter(u => u.role === 'organizer').length;
        const averageAttendance = events.length
          ? (events.reduce((sum, e) => sum + (e.attendeesCount || 0), 0) / events.length) * 100
          : 0;

        // Events by type
        const eventsByType = {};
        events.forEach(e => {
          const type = e.category?.toLowerCase() || 'other';
          eventsByType[type] = (eventsByType[type] || 0) + 1;
        });

        contests.forEach(c => {
          eventsByType['contest'] = (eventsByType['contest'] || 0) + 1;
        });

        // Top organizers
        const organizersMap = {};
        events.forEach(e => {
          const org = e.organizerName || 'Unknown';
          organizersMap[org] = (organizersMap[org] || 0) + 1;
        });
        contests.forEach(c => {
          const org = c.organizer.fullName || 'Unknown';
          organizersMap[org] = (organizersMap[org] || 0) + 1;
        });

        const topOrganizers = Object.entries(organizersMap)
          .map(([name, events]) => ({ name, events }))
          .sort((a, b) => b.events - a.events)
          .slice(0, 5);

        setStats({
          totalEvents,
          totalTickets,
          activeOrganizers,
          averageAttendance,
          eventsByType,
          topOrganizers
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#2D1B4E' }}>
        Analytics Dashboard
      </h2>

      <div className="stats-grid">
        <div className="stat-card">
          <Calendar className="stat-icon" size={32} />
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{stats.totalEvents}</div>
        </div>
        <div className="stat-card">
          <Ticket className="stat-icon" size={32} />
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value">{stats.totalTickets}</div>
        </div>
        <div className="stat-card">
          <Users className="stat-icon" size={32} />
          <div className="stat-label">Active Organizers</div>
          <div className="stat-value">{stats.activeOrganizers}</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" size={32} />
          <div className="stat-label">Avg Attendance</div>
          <div className="stat-value">{stats.averageAttendance.toFixed(1)}%</div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Events by Type</h3>
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats.eventsByType).map(([type, count]) => {
              const maxCount = Math.max(...Object.values(stats.eventsByType));
              const percentage = (count / maxCount) * 100;
              return (
                <div key={type}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    <span style={{ textTransform: 'capitalize', color: '#2D1B4E' }}>{type}</span>
                    <span style={{ color: '#7C6BA5' }}>{count} events</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '24px',
                      background: '#F2EFFF',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: eventTypeColors[type] || '#7C6BA5',
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '12px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Top Organizers</h3>
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Organization</th>
                <th>Events Created</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {stats.topOrganizers.map((org, index) => (
                <tr key={index}>
                  <td>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background:
                          index === 0
                            ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                            : index === 1
                              ? 'linear-gradient(135deg, #C0C0C0, #808080)'
                              : index === 2
                                ? 'linear-gradient(135deg, #CD7F32, #8B4513)'
                                : '#E0CFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: index < 3 ? '#FFFFFF' : '#4B3B72'
                      }}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{org.name}</td>
                  <td>{org.events}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '8px',
                          background: '#F2EFFF',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min((org.events / Math.max(...stats.topOrganizers.map(o => o.events))) * 100, 100)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #7C6BA5, #A084FF)',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: '#7C6BA5', fontWeight: 600 }}>
                        {org.events} events
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title">Export Reports</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary">Export to CSV</button>
            <button className="btn btn-primary">Export to PDF</button>
          </div>
        </div>
        <p style={{ marginTop: '12px', color: '#7C6BA5', fontSize: '14px' }}>
          Download detailed analytics reports for further analysis and record keeping.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
