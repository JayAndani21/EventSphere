import { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle, Clock, Eye } from 'lucide-react';

const PublishedEvents = () => {
  const demoEvents = [
    {
      id: 1,
      name: 'Tech Conference 2025',
      description: 'A conference about emerging tech trends.',
      type: 'conference',
      organizers: { organization_name: 'Tech Corp' },
      event_date: '2025-11-15T10:00:00Z',
      location: 'Mumbai Convention Center',
      capacity: 200,
      tickets_issued: 150,
      approval_comment: 'Approved by Admin',
      status: 'published'
    },
    {
      id: 2,
      name: 'Startup Workshop',
      description: 'Hands-on workshop for startup enthusiasts.',
      type: 'workshop',
      organizers: { organization_name: 'InnovateX' },
      event_date: '2025-12-05T14:00:00Z',
      location: 'Ahmedabad Hall',
      capacity: 50,
      tickets_issued: 30,
      status: 'published'
    },
    {
      id: 3,
      name: 'Coding Contest 2025',
      description: 'Competitive programming challenge.',
      type: 'contest',
      organizers: { organization_name: 'Code Arena' },
      event_date: '2025-09-20T09:00:00Z',
      location: 'Online',
      capacity: 100,
      tickets_issued: 100,
      status: 'completed'
    }
  ];

  const [events, setEvents] = useState(demoEvents);
  const [filteredEvents, setFilteredEvents] = useState(demoEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, totalTickets: 0 });
  const [viewingEvent, setViewingEvent] = useState(null);

  useEffect(() => {
    filterEvents();
    calculateStats();
  }, [searchTerm, typeFilter, timeFilter, events]);

  const filterEvents = () => {
    let filtered = [...events];
    const now = new Date();

    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((event) => event.type === typeFilter);
    }

    if (timeFilter === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.event_date) > now);
    } else if (timeFilter === 'past') {
      filtered = filtered.filter((event) => new Date(event.event_date) <= now);
    }

    setFilteredEvents(filtered);
  };

  const calculateStats = () => {
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.event_date) > now).length;
    const past = events.filter((e) => new Date(e.event_date) <= now).length;
    const totalTickets = events.reduce((sum, e) => sum + e.tickets_issued, 0);

    setStats({ total: events.length, upcoming, past, totalTickets });
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <Calendar className="stat-icon" size={32} />
          <div className="stat-label">Total Published</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" size={32} />
          <div className="stat-label">Upcoming Events</div>
          <div className="stat-value">{stats.upcoming}</div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" size={32} />
          <div className="stat-label">Past Events</div>
          <div className="stat-value">{stats.past}</div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" size={32} />
          <div className="stat-label">Total Tickets Issued</div>
          <div className="stat-value">{stats.totalTickets}</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Published Events</h2>
        </div>

        <div className="search-filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7C6BA5' }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="contest">Contest</option>
            <option value="seminar">Seminar</option>
            <option value="other">Other</option>
          </select>
          <select className="filter-select" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Type</th>
                <th>Organizer</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Tickets</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const isUpcoming = new Date(event.event_date) > new Date();
                const ticketPercentage = (event.tickets_issued / event.capacity) * 100;

                return (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{event.type}</td>
                    <td>{event.organizers?.organization_name}</td>
                    <td>{new Date(event.event_date).toLocaleString()}</td>
                    <td>{event.location}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{event.tickets_issued} / {event.capacity}</span>
                        <div style={{ width: '40px', height: '4px', background: '#E0CFFF', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${ticketPercentage}%`, height: '100%', background: ticketPercentage > 80 ? '#7C6BA5' : '#A084FF', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${isUpcoming ? 'status-published' : 'status-approved'}`}>
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => setViewingEvent(event)} title="View Details">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No published events found</div>
            </div>
          )}
        </div>
      </div>

      {viewingEvent && (
        <div className="modal-overlay" onClick={() => setViewingEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Event Details</h3>
              <button className="modal-close" onClick={() => setViewingEvent(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-field"><label className="modal-label">Event Name</label><div className="modal-value">{viewingEvent.name}</div></div>
              <div className="modal-field"><label className="modal-label">Description</label><div className="modal-value">{viewingEvent.description}</div></div>
              <div className="modal-field"><label className="modal-label">Type</label><div className="modal-value">{viewingEvent.type}</div></div>
              <div className="modal-field"><label className="modal-label">Organizer</label><div className="modal-value">{viewingEvent.organizers?.organization_name}</div></div>
              <div className="modal-field"><label className="modal-label">Date & Time</label><div className="modal-value">{new Date(viewingEvent.event_date).toLocaleString()}</div></div>
              <div className="modal-field"><label className="modal-label">Location</label><div className="modal-value">{viewingEvent.location}</div></div>
              <div className="modal-field"><label className="modal-label">Capacity</label><div className="modal-value">{viewingEvent.capacity} attendees</div></div>
              <div className="modal-field"><label className="modal-label">Tickets Issued</label><div className="modal-value">{viewingEvent.tickets_issued} ({((viewingEvent.tickets_issued / viewingEvent.capacity) * 100).toFixed(1)}% filled)</div></div>
              {viewingEvent.approval_comment && <div className="modal-field"><label className="modal-label">Admin Comment</label><div className="modal-value">{viewingEvent.approval_comment}</div></div>}
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setViewingEvent(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishedEvents;
