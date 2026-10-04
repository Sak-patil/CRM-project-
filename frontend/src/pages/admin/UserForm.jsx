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

  if (loading) return <div className="content-page" style={{ padding: '28px 32px' }}>Loading team member...</div>;

  return (
    <div className="content-page form-page" style={{ padding: '28px 32px', maxWidth: '620px', margin: '0 auto' }}>
      <div className="page-header"><h2>{isEditing ? 'Edit team member' : 'Add team member'}</h2><p>Set up access for a sales executive.</p></div>
      
      {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} className="premium-card">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="premium-input"
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
            className="premium-input"
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
            className="premium-input"
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
            className="premium-input"
          />
        </div>

        <div className="flex-row" style={{ marginTop: '24px' }}>
          <button type="submit" disabled={saving} className="premium-btn premium-btn-primary">
            {saving ? 'Saving...' : 'Save User'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/admin/users')}
            className="premium-btn premium-btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
