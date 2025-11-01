import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewingEvent, setViewingEvent] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [actionType, setActionType] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/all?status=draft`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
        setFilteredEvents(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch events');
      }
    } catch (err) {
      toast.error('Failed to fetch events');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];
    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((event) => event.eventType.toLowerCase() === typeFilter);
    }
    setFilteredEvents(filtered);
  }, [searchTerm, typeFilter, events]);

  const handleApprove = async (event) => {
    try {
      const res = await fetch(`${API_BASE}/events/${event._id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev._id !== event._id));
        setFilteredEvents((prev) => prev.filter((ev) => ev._id !== event._id));
        toast.success('✅ Event approved successfully');
      } else {
        toast.error(data.message || 'Failed to approve event');
      }
    } catch (err) {
      toast.error('Failed to approve event');
      console.error(err);
    } finally {
      setViewingEvent(null);
      setActionType(null);
      setApprovalComment('');
    }
  };

  const handleReject = async (event) => {
    if (!approvalComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/events/${event._id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({ comment: approvalComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev._id !== event._id));
        setFilteredEvents((prev) => prev.filter((ev) => ev._id !== event._id));
        toast.error('Event rejected successfully');
      } else {
        toast.error(data.message || 'Failed to reject event');
      }
    } catch (err) {
      toast.error('Failed to reject event');
      console.error(err);
    } finally {
      setViewingEvent(null);
      setActionType(null);
      setApprovalComment('');
    }
  };

  const openApprovalModal = (event, type) => {
    setViewingEvent(event);
    setActionType(type);
    setApprovalComment('');
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Pending Events Approval</h2>
        </div>

        <div className="search-filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7C6BA5',
              }}
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
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event._id}>
                    <td>{event.eventName}</td>
                    <td style={{ textTransform: 'capitalize' }}>{event.eventType}</td>
                    <td>{event.organizerName}</td>
                    <td>{new Date(event.date).toLocaleString()}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setViewingEvent(event);
                            setActionType(null);
                          }}
                          title="View Details"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className="btn-approve"
                          onClick={() => openApprovalModal(event, 'approve')}
                          title="Approve"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => openApprovalModal(event, 'reject')}
                          title="Reject"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                    No pending events
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingEvent && (
        <div
          className="modal-overlay"
          onClick={() => {
            setViewingEvent(null);
            setActionType(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType
                  ? actionType === 'approve'
                    ? 'Approve Event'
                    : 'Reject Event'
                  : 'Event Details'}
              </h3>
              <button
                className="modal-close"
                onClick={() => {
                  setViewingEvent(null);
                  setActionType(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Event Name</label>
                <div className="modal-value">{viewingEvent.eventName}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Type</label>
                <div className="modal-value" style={{ textTransform: 'capitalize' }}>
                  {viewingEvent.eventType}
                </div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Organizer</label>
                <div className="modal-value">{viewingEvent.organizerName}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Date & Time</label>
                <div className="modal-value">
                  {new Date(viewingEvent.date).toLocaleString()}
                </div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Capacity</label>
                <div className="modal-value">{viewingEvent.capacity}</div>
              </div>
              {actionType && (
                <div className="modal-field">
                  <label className="modal-label">
                    {actionType === 'approve'
                      ? 'Approval Comment (Optional)'
                      : 'Rejection Reason (Required)'}
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
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setViewingEvent(null);
                  setActionType(null);
                }}
              >
                Cancel
              </button>
              {actionType === 'approve' && (
                <button
                  className="btn btn-approve"
                  onClick={() => handleApprove(viewingEvent)}
                >
                  <CheckCircle size={16} /> Approve Event
                </button>
              )}
              {actionType === 'reject' && (
                <button
                  className="btn btn-reject"
                  onClick={() => handleReject(viewingEvent)}
                >
                  <X size={16} /> Reject Event
                </button>
              )}
              {!actionType && (
                <>
                  <button
                    className="btn btn-approve"
                    onClick={() => setActionType('approve')}
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => setActionType('reject')}
                  >
                    <X size={16} /> Reject
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
