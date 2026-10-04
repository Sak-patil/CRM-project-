import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/users';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.data.users);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setDeleteError('');
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setDeleteError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to delete user');
      // Hide error after 5 seconds
      setTimeout(() => setDeleteError(''), 5000);
    }
  };

  if (loading) return <div className="content-page" style={{ padding: '28px 32px' }}>Loading team members...</div>;

  return (
    <div className="content-page" style={{ padding: '28px 32px' }}>
      <div className="page-header flex-between">
        <div><h2>Sales team</h2><p>Manage account owners and their access.</p></div>
        <Link to="/admin/users/new" className="premium-btn premium-btn-primary">
          + Add team member
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {deleteError && <div className="error-message" style={{ marginBottom: '15px' }}>{deleteError}</div>}

      <div className="premium-card list-card">
      {users.length === 0 && !error ? (
        <div className="empty-state">No sales executives yet. Add your first team member to get started.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}><table className="premium-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td className="summary-cell">{user.name}</td><td className="muted-cell">{user.email}</td><td className="muted-cell">{user.phone || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <Link to={`/admin/users/${user._id}/edit`} className="inline-action">Edit</Link>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    className="inline-action danger-action"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
      </div>
    </div>
  );
};

export default UsersList;
