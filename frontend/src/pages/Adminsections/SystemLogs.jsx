import { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';

const SystemLogs = () => {
  const demoLogs = [
    {
      id: 1,
      created_at: '2025-10-10T10:15:00Z',
      action: 'User approved',
      target_type: 'user',
      details: { username: 'johndoe', email: 'john@example.com' }
    },
    {
      id: 2,
      created_at: '2025-10-09T14:30:00Z',
      action: 'Event rejected',
      target_type: 'event',
      details: { event_name: 'Tech Workshop', reason: 'Incomplete details' }
    },
    {
      id: 3,
      created_at: '2025-10-08T09:00:00Z',
      action: 'Organizer blocked',
      target_type: 'organizer',
      details: { organization_name: 'InnovateX' }
    },
    {
      id: 4,
      created_at: '2025-10-07T16:45:00Z',
      action: 'User updated',
      target_type: 'user',
      details: { username: 'alice', field: 'email', new_value: 'alice@newmail.com' }
    }
  ];

  const [logs, setLogs] = useState(demoLogs);
  const [filteredLogs, setFilteredLogs] = useState(demoLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  useEffect(() => {
    filterLogs();
  }, [searchTerm, actionFilter, targetFilter]);

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(actionFilter.toLowerCase())
      );
    }

    if (targetFilter !== 'all') {
      filtered = filtered.filter((log) => log.target_type === targetFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action) => {
    if (action.includes('approved') || action.includes('active')) {
      return '#A084FF';
    } else if (action.includes('rejected') || action.includes('deleted') || action.includes('blocked')) {
      return '#FFB3C1';
    } else if (action.includes('updated')) {
      return '#D9B3FF';
    }
    return '#E0CFFF';
  };

  return (
    <div>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">System Activity Logs</h2>
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
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select className="filter-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
            <option value="deleted">Deleted</option>
            <option value="updated">Updated</option>
          </select>
          <select className="filter-select" value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}>
            <option value="all">All Targets</option>
            <option value="user">Users</option>
            <option value="organizer">Organizers</option>
            <option value="event">Events</option>
            <option value="system">System</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '13px' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: getActionColor(log.action),
                        color: log.action.includes('rejected') || log.action.includes('deleted') || log.action.includes('blocked') ? '#8B2635' : '#FFFFFF'
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{log.target_type}</td>
                  <td>
                    {log.details ? (
                      <div style={{ fontSize: '13px', color: '#5A4E7C' }}>
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#A0A0A0', fontSize: '13px' }}>No details</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="empty-state">
              <FileText className="empty-state-icon" size={48} />
              <div className="empty-state-text">No system logs found</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: '#F2EFFF', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#5A4E7C', margin: 0 }}>
            Showing the last 100 system activities. All admin actions are logged for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
