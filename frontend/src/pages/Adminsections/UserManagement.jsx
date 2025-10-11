import { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch users from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/usersdata', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer admin-token', // replace with your real token
          },
        });

        const data = await res.json();
        if (!data.success) throw new Error('Failed to fetch users');

        // ✅ Normalize and clean user data
        const formattedUsers = data.data.map((user) => ({
          ...user,
          name:  user.fullName || 'Unknown User',
          createdDate:
            user.createdAt ||
            null,
        }));

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } catch (err) {
        console.error(err);
        setError('Unable to load users from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ Filter users by search and role
  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // ✅ Delete a user
  const deleteUser = async (user) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      await fetch(`http://localhost:5000/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
      });

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Error deleting user.');
    }
  };

  // ✅ Save edits
  const saveEdit = async () => {
    if (!editingUser) return;

    try {
      await fetch(`http://localhost:5000/api/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify(editingUser),
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u))
      );
      setEditingUser(null);
    } catch (err) {
      console.error('Edit failed:', err);
      alert('Error saving changes.');
    }
  };

  // ✅ Loading & Error handling
  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">User Management</h2>
        </div>

        {/* 🔍 Search and Role Filter */}
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="attendee">Attendee</option>
          </select>
        </div>

        {/* 📋 User Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created Date</th>
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
                    {user.createdDate
                      ? new Date(user.createdDate).toLocaleDateString('en-US')
                      : '—'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteUser(user)}
                      >
                        <Trash2 size={14} /> Delete
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

      {/* ✏️ Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User</h3>
              <button
                className="modal-close"
                onClick={() => setEditingUser(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Name</label>
                <input
                  type="text"
                  className="search-input"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Email</label>
                <input
                  type="email"
                  className="search-input"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Role</label>
                <select
                  className="filter-select"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  style={{ width: '100%' }}
                >
                  <option value="attendee">Attendee</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
