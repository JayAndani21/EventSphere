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
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'contests'

  const API_BASE = 'http://localhost:5000/api';

  // Fetch pending/draft events from backend
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/all?status=draft`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const text = await res.text();
      if (!text) {
        toast.error('Empty response from server');
        return;
      }
      
      const data = JSON.parse(text);
      if (data.success) {
        setEvents(data.data);
        setFilteredEvents(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Fetch events error:', err);
      toast.error('Failed to fetch events: ' + err.message);
    }
  };

  // Fetch pending contests from backend
  const fetchContests = async () => {
    try {
      const res = await fetch(`${API_BASE}/contests/admin/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const text = await res.text();
      if (!text) {
        toast.error('Empty response from server');
        return;
      }
      
      const data = JSON.parse(text);
      if (data.success) {
        setEvents(data.data);
        setFilteredEvents(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch pending contests');
      }
    } catch (err) {
      console.error('Fetch contests error:', err);
      toast.error('Failed to fetch pending contests: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else {
      fetchContests();
    }
  }, [activeTab]);

  // Filter events/contests by search term and type
  useEffect(() => {
    let filtered = [...events];
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contestName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => 
        item.eventType?.toLowerCase() === typeFilter || 
        item.type?.toLowerCase() === typeFilter
      );
    }
    setFilteredEvents(filtered);
  }, [searchTerm, typeFilter, events]);

  const handleApprove = async (item) => {
    try {
      const endpoint = activeTab === 'events' 
        ? `${API_BASE}/events/${item._id}/approve`
        : `${API_BASE}/contests/${item._id}/approve`;
      
      const res = await fetch(endpoint, {
        method: activeTab === 'events' ? 'PUT' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== item._id));
        setFilteredEvents((prev) => prev.filter((e) => e._id !== item._id));
        toast.success('✅ ' + (activeTab === 'events' ? 'Event' : 'Contest') + ' approved successfully');
      } else {
        toast.error(data.message || 'Failed to approve');
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('Failed to approve: ' + err.message);
    } finally {
      setViewingEvent(null);
      setActionType(null);
      setApprovalComment('');
    }
  };

  const handleReject = async (item) => {
    if (!approvalComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      const endpoint = activeTab === 'events'
        ? `${API_BASE}/events/${item._id}/reject`
        : `${API_BASE}/contests/${item._id}/reject`;
      
      const res = await fetch(endpoint, {
        method: activeTab === 'events' ? 'PUT' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({ comment: approvalComment }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== item._id));
        setFilteredEvents((prev) => prev.filter((e) => e._id !== item._id));
        toast.error('❌ ' + (activeTab === 'events' ? 'Event' : 'Contest') + ' rejected successfully');
      } else {
        toast.error(data.message || 'Failed to reject');
      }
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('Failed to reject: ' + err.message);
    } finally {
      setViewingEvent(null);
      setActionType(null);
      setApprovalComment('');
    }
  };

  const openApprovalModal = (item, type) => {
    setViewingEvent(item);
    setActionType(type);
    setApprovalComment('');
  };

  const getDisplayName = (item) => {
    return item.eventName || item.name || 'N/A';
  };

  const getDisplayType = (item) => {
    return item.eventType || item.type || 'Contest';
  };

  const getDisplayOrganizer = (item) => {
    if (item.organizerName) return item.organizerName;
    if (item.organizer?.fullName) return item.organizer.fullName;
    return item.createdBy || 'N/A';
  };

  const getDisplayDate = (item) => {
    const date = item.date || item.startDate;
    return date ? new Date(date).toLocaleString() : 'N/A';
  };

  const getDisplayCapacity = (item) => {
    return item.capacity || item.maxSubmissions || 'N/A';
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Pending Approval Dashboard</h2>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('events');
                setSearchTerm('');
                setTypeFilter('all');
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'events' ? '#7C6BA5' : '#E8E8E8',
                color: activeTab === 'events' ? 'white' : 'black',
                fontWeight: 'bold',
              }}
            >
              Events
            </button>
            <button
              className={`tab-btn ${activeTab === 'contests' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('contests');
                setSearchTerm('');
                setTypeFilter('all');
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'contests' ? '#7C6BA5' : '#E8E8E8',
                color: activeTab === 'contests' ? 'white' : 'black',
                fontWeight: 'bold',
              }}
            >
              Contests
            </button>
          </div>
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
              placeholder={`Search ${activeTab === 'events' ? 'events' : 'contests'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{activeTab === 'events' ? 'Event Name' : 'Contest Name'}</th>
                <th>Type</th>
                <th>{activeTab === 'events' ? 'Organizer' : 'Created By'}</th>
                <th>{activeTab === 'events' ? 'Date & Time' : 'Start Date'}</th>
                <th>{activeTab === 'events' ? 'Capacity' : 'Participants'}</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
                filteredEvents.map((item) => (
                  <tr key={item._id}>
                    <td>{getDisplayName(item)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{getDisplayType(item)}</td>
                    <td>{getDisplayOrganizer(item)}</td>
                    <td>{getDisplayDate(item)}</td>
                    <td>{item.capacity || item.maxSubmissions || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>{item.status}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={() => { setViewingEvent(item); setActionType(null); }}
                          title="View Details"
                        >
                          <Eye size={14} />View
                        </button>
                        <button
                          className="btn btn-approve"
                          onClick={() => openApprovalModal(item, 'approve')}
                          title="Approve"
                        >
                          <CheckCircle size={14} />Approve
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => openApprovalModal(item, 'reject')}
                          title="Reject"
                        >
                          <X size={14} />Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                    No pending {activeTab === 'events' ? 'events' : 'contests'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingEvent && (
        <div className="modal-overlay" onClick={() => { setViewingEvent(null); setActionType(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType ? (actionType === 'approve' ? 'Approve ' + (activeTab === 'events' ? 'Event' : 'Contest') : 'Reject ' + (activeTab === 'events' ? 'Event' : 'Contest')) : (activeTab === 'events' ? 'Event' : 'Contest') + ' Details'}
              </h3>
              <button className="modal-close" onClick={() => { setViewingEvent(null); setActionType(null); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">{activeTab === 'events' ? 'Event Name' : 'Contest Name'}</label>
                <div className="modal-value">{getDisplayName(viewingEvent)}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Type</label>
                <div className="modal-value" style={{ textTransform: 'capitalize' }}>{getDisplayType(viewingEvent)}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">{activeTab === 'events' ? 'Organizer' : 'Created By'}</label>
                <div className="modal-value">{getDisplayOrganizer(viewingEvent)}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">{activeTab === 'events' ? 'Date & Time' : 'Start Date'}</label>
                <div className="modal-value">{getDisplayDate(viewingEvent)}</div>
              </div>
              <div className="modal-field">
                <label className="modal-label">{activeTab === 'events' ? 'Capacity' : 'Max Submissions'}</label>
                <div className="modal-value">{viewingEvent.capacity || viewingEvent.maxSubmissions || 'N/A'}</div>
              </div>
              {activeTab === 'contests' && (
                <>
                  <div className="modal-field">
                    <label className="modal-label">Prize</label>
                    <div className="modal-value">₹{viewingEvent.prize || 'N/A'}</div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Allowed Languages</label>
                    <div className="modal-value">{viewingEvent.allowedLanguages?.join(', ') || 'N/A'}</div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Total Participants</label>
                    <div className="modal-value">{viewingEvent.stats?.totalParticipants || 0}</div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Penalty (minutes)</label>
                    <div className="modal-value">{viewingEvent.penalty || 'N/A'}</div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Description</label>
                    <div className="modal-value" style={{ whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'auto' }}>
                      {viewingEvent.description || 'N/A'}
                    </div>
                  </div>
                </>
              )}
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
                        : 'Explain why this is being rejected...'
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
                  <CheckCircle size={16} /> Approve
                </button>
              )}
              {actionType === 'reject' && (
                <button className="btn btn-reject" onClick={() => handleReject(viewingEvent)}>
                  <X size={16} /> Reject
                </button>
              )}
              {!actionType && (
                <>
                  <button className="btn btn-approve" onClick={() => setActionType('approve')}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="btn btn-reject" onClick={() => setActionType('reject')}>
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