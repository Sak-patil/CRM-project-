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

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="users-list-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Sales Executives</h2>
        <Link to="/admin/users/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Add New User
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {deleteError && <div className="error-message" style={{ marginBottom: '15px' }}>{deleteError}</div>}

      {users.length === 0 && !error ? (
        <p>No users found. Create one to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Phone</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.email}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.phone || 'N/A'}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <Link to={`/admin/users/${user._id}/edit`} style={{ marginRight: '10px' }}>Edit</Link>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: 0 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersList;
