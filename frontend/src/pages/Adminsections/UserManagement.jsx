import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';

const UserManagement = () => {
  const demoUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', created_at: '2025-10-01T10:00:00Z' },
    { id: 2, name: 'Alice Smith', email: 'alice@example.com', role: 'organizer', status: 'blocked', created_at: '2025-09-28T14:30:00Z' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'attendee', status: 'active', created_at: '2025-09-30T09:15:00Z' },
    { id: 4, name: 'Carol White', email: 'carol@example.com', role: 'organizer', status: 'pending', created_at: '2025-10-03T16:45:00Z' }
  ];

  const [users, setUsers] = useState(demoUsers);
  const [filteredUsers, setFilteredUsers] = useState(demoUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const toggleStatus = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
      )
    );
  };

  const deleteUser = (user) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const saveEdit = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  return (
    <div>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">User Management</h2>
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="attendee">Attendee</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>{user.status}</span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary" onClick={() => setEditingUser(user)} title="Edit User">
                        <Edit size={14} />
                      </button>
                      <button
                        className={`btn ${user.status === 'active' ? 'btn-reject' : 'btn-approve'}`}
                        onClick={() => toggleStatus(user)}
                        title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                      >
                        {user.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button className="btn btn-danger" onClick={() => deleteUser(user)} title="Delete User">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No users found</div>
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Name</label>
                <input
                  type="text"
                  className="search-input"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Email</label>
                <input
                  type="email"
                  className="search-input"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Role</label>
                <select
                  className="filter-select"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="attendee">Attendee</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
