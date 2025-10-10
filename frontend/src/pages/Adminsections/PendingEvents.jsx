import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, X } from 'lucide-react';

const PendingEvents = () => {
  // Demo events data
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
      status: 'pending'
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
      status: 'pending'
    }
  ];

  const [events, setEvents] = useState(demoEvents);
  const [filteredEvents, setFilteredEvents] = useState(demoEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewingEvent, setViewingEvent] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, typeFilter, events]);

  const filterEvents = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((event) => event.type === typeFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleApprove = (event) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id
          ? { ...ev, status: 'approved', approval_comment: approvalComment || 'Approved' }
          : ev
      )
    );
    setViewingEvent(null);
    setActionType(null);
    setApprovalComment('');
  };

  const handleReject = (event) => {
    if (!approvalComment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id
          ? { ...ev, status: 'rejected', approval_comment: approvalComment }
          : ev
      )
    );
    setViewingEvent(null);
    setActionType(null);
    setApprovalComment('');
  };

  const openApprovalModal = (event, type) => {
    setViewingEvent(event);
    setActionType(type);
    setApprovalComment('');
  };

  return (
    <div>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Pending Events Approval</h2>
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
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Type</th>
                <th>Organizer</th>
                <th>Date & Time</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{event.type}</td>
                  <td>{event.organizers?.organization_name}</td>
                  <td>{new Date(event.event_date).toLocaleString()}</td>
                  <td>{event.capacity}</td>
                  <td>
                    <span className={`status-badge status-${event.status}`}>{event.status}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-secondary"
                        onClick={() => { setViewingEvent(event); setActionType(null); }}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-approve"
                        onClick={() => openApprovalModal(event, 'approve')}
                        title="Approve"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => openApprovalModal(event, 'reject')}
                        title="Reject"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No pending events</div>
            </div>
          )}
        </div>
      </div>

      {viewingEvent && (
        <div className="modal-overlay" onClick={() => { setViewingEvent(null); setActionType(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType ? (actionType === 'approve' ? 'Approve Event' : 'Reject Event') : 'Event Details'}
              </h3>
              <button className="modal-close" onClick={() => { setViewingEvent(null); setActionType(null); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Event Name</label>
                <div className="modal-value">{viewingEvent.name}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Description</label>
                <div className="modal-value">{viewingEvent.description}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Type</label>
                <div className="modal-value" style={{ textTransform: 'capitalize' }}>{viewingEvent.type}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Organizer</label>
                <div className="modal-value">{viewingEvent.organizers?.organization_name}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Date & Time</label>
                <div className="modal-value">{new Date(viewingEvent.event_date).toLocaleString()}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Location</label>
                <div className="modal-value">{viewingEvent.location}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Capacity</label>
                <div className="modal-value">{viewingEvent.capacity} attendees</div>
              </div>

              {actionType && (
                <div className="modal-field">
                  <label className="modal-label">
                    {actionType === 'approve' ? 'Approval Comment (Optional)' : 'Rejection Reason (Required)'}
                  </label>
                  <textarea
                    className="modal-textarea"
                    placeholder={
                      actionType === 'approve'
                        ? 'Add a comment for the organizer...'
                        : 'Explain why this event is being rejected...'
                    }
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setViewingEvent(null); setActionType(null); }}>
                Cancel
              </button>
              {actionType === 'approve' && (
                <button className="btn btn-approve" onClick={() => handleApprove(viewingEvent)}>
                  <CheckCircle size={16} />
                  Approve Event
                </button>
              )}
              {actionType === 'reject' && (
                <button className="btn btn-reject" onClick={() => handleReject(viewingEvent)}>
                  <X size={16} />
                  Reject Event
                </button>
              )}
              {!actionType && (
                <>
                  <button className="btn btn-approve" onClick={() => setActionType('approve')}>
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button className="btn btn-reject" onClick={() => setActionType('reject')}>
                    <X size={16} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingEvents;
