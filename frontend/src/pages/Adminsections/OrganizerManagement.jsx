import { useState, useEffect } from 'react';
import { Search, Eye, Ban, CheckCircle, X } from 'lucide-react';

const OrganizerManagement = () => {
  // Demo organizer data
  const demoOrganizers = [
    {
      id: 1,
      organization_name: 'Tech Corp',
      users: { email: 'admin@techcorp.com' },
      events_created: 10,
      status: 'approved',
      created_at: '2025-10-01T12:00:00Z',
      events: [
        { id: 1, name: 'Tech Conference', type: 'conference', event_date: '2025-11-01', status: 'published', tickets_issued: 100, capacity: 150 },
        { id: 2, name: 'Workshop X', type: 'workshop', event_date: '2025-12-01', status: 'published', tickets_issued: 50, capacity: 50 }
      ]
    },
    {
      id: 2,
      organization_name: 'Eventify',
      users: { email: 'contact@eventify.com' },
      events_created: 5,
      status: 'pending',
      created_at: '2025-09-15T12:00:00Z',
      events: []
    },
    {
      id: 3,
      organization_name: 'InnovateX',
      users: { email: 'hello@innovatex.com' },
      events_created: 3,
      status: 'blocked',
      created_at: '2025-08-20T12:00:00Z',
      events: []
    }
  ];

  const [organizers, setOrganizers] = useState(demoOrganizers);
  const [filteredOrganizers, setFilteredOrganizers] = useState(demoOrganizers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingEvents, setViewingEvents] = useState(null);

  useEffect(() => {
    filterOrganizers();
  }, [searchTerm, statusFilter]);

  const filterOrganizers = () => {
    let filtered = [...organizers];

    if (searchTerm) {
      filtered = filtered.filter(
        (org) =>
          org.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.users?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((org) => org.status === statusFilter);
    }

    setFilteredOrganizers(filtered);
  };

  const handleApproveOrganizer = (organizer) => {
    setOrganizers((prev) =>
      prev.map((org) =>
        org.id === organizer.id ? { ...org, status: 'approved' } : org
      )
    );
  };

  const handleRejectOrganizer = (organizer) => {
    setOrganizers((prev) =>
      prev.map((org) =>
        org.id === organizer.id ? { ...org, status: 'rejected' } : org
      )
    );
  };

  const handleToggleBlock = (organizer) => {
    setOrganizers((prev) =>
      prev.map((org) =>
        org.id === organizer.id
          ? { ...org, status: org.status === 'blocked' ? 'approved' : 'blocked' }
          : org
      )
    );
  };

  const handleViewEvents = (organizer) => {
    setViewingEvents({ organizer, events: organizer.events || [] });
  };

  return (
    <div>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Organizer Management</h2>
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
              placeholder="Search by organization or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Email</th>
                <th>Events Created</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizers.map((org) => (
                <tr key={org.id}>
                  <td>{org.organization_name}</td>
                  <td>{org.users?.email}</td>
                  <td>{org.events_created}</td>
                  <td>
                    <span className={`status-badge status-${org.status}`}>{org.status}</span>
                  </td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary" onClick={() => handleViewEvents(org)} title="View Events">
                        <Eye size={14} />
                      </button>
                      {org.status === 'pending' && (
                        <>
                          <button className="btn btn-approve" onClick={() => handleApproveOrganizer(org)} title="Approve">
                            <CheckCircle size={14} />
                          </button>
                          <button className="btn btn-reject" onClick={() => handleRejectOrganizer(org)} title="Reject">
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {(org.status === 'approved' || org.status === 'blocked') && (
                        <button
                          className={`btn ${org.status === 'blocked' ? 'btn-approve' : 'btn-danger'}`}
                          onClick={() => handleToggleBlock(org)}
                          title={org.status === 'blocked' ? 'Unblock' : 'Block'}
                        >
                          {org.status === 'blocked' ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrganizers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No organizers found</div>
            </div>
          )}
        </div>
      </div>

      {viewingEvents && (
        <div className="modal-overlay" onClick={() => setViewingEvents(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Events by {viewingEvents.organizer.organization_name}</h3>
              <button className="modal-close" onClick={() => setViewingEvents(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {viewingEvents.events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-text">No events created yet</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Tickets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingEvents.events.map((event) => (
                        <tr key={event.id}>
                          <td>{event.name}</td>
                          <td style={{ textTransform: 'capitalize' }}>{event.type}</td>
                          <td>{new Date(event.event_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge status-${event.status}`}>{event.status}</span>
                          </td>
                          <td>
                            {event.tickets_issued} / {event.capacity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerManagement;
