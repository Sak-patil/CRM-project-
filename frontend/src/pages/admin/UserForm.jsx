import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, createUser, updateUser } from '../../api/users';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'salesExecutive'
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const data = await getUser(id);
      const user = data.data.user;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Never populate password
        phone: user.phone || '',
        role: user.role || 'salesExecutive'
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        // Exclude password if empty when editing
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await updateUser(id, updateData);
      } else {
        await createUser(formData);
      }
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading user data...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
      
      {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password {isEditing ? '(leave blank to keep current)' : '*'}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save User'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/admin/users')}
            style={{ padding: '10px 15px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
