import { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle, Clock, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PublishedEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, totalTickets: 0 });
  const [viewingEvent, setViewingEvent] = useState(null);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events/all');
      const data = await res.json();

      if (data.success) {
        // Map API response to frontend format
        const apiEvents = data.data.map((event) => ({
          id: event._id,
          name: event.eventName,
          description: event.description || '',
          type: event.eventType.toLowerCase(),
          organizers: { organization_name: event.organizerName },
          event_date: event.date,
          location: event.venueName,
          capacity: event.capacity,
          tickets_issued: event.attendeesCount || 0,
          approval_comment: event.approvalComment || '',
          status: event.status
        }));
        setEvents(apiEvents);
        setFilteredEvents(apiEvents);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while fetching events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
      <Toaster position="top-right" reverseOrder={false} />
      
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
              {filteredEvents.length > 0 ? filteredEvents.map((event) => {
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
                        <Eye size={14} />View
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '16px' }}>No published events found</td></tr>
              )}
            </tbody>
          </table>
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
              <div className="modal-field"><label>Event Name</label><div>{viewingEvent.name}</div></div>
              <div className="modal-field"><label>Description</label><div>{viewingEvent.description}</div></div>
              <div className="modal-field"><label>Type</label><div>{viewingEvent.type}</div></div>
              <div className="modal-field"><label>Organizer</label><div>{viewingEvent.organizers?.organization_name}</div></div>
              <div className="modal-field"><label>Date & Time</label><div>{new Date(viewingEvent.event_date).toLocaleString()}</div></div>
              <div className="modal-field"><label>Location</label><div>{viewingEvent.location}</div></div>
              <div className="modal-field"><label>Capacity</label><div>{viewingEvent.capacity} attendees</div></div>
              <div className="modal-field"><label>Tickets Issued</label><div>{viewingEvent.tickets_issued} ({((viewingEvent.tickets_issued / viewingEvent.capacity) * 100).toFixed(1)}% filled)</div></div>
              {viewingEvent.approval_comment && <div className="modal-field"><label>Admin Comment</label><div>{viewingEvent.approval_comment}</div></div>}
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setViewingEvent(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishedEvents;
