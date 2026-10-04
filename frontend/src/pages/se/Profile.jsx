import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../api/users';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

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
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully! Note: You may need to log out and log back in to see changes everywhere.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-page form-page" style={{ padding: '28px 32px', maxWidth: '620px', margin: '0 auto' }}>
      <div className="page-header"><h2>My profile</h2><p>{user?.email} · {user?.role === 'admin' ? 'Administrator' : 'Sales executive'}</p></div>
      
      {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '15px' }}>{success}</div>}
      
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

        <div style={{ marginTop: '10px' }}>
          <button type="submit" disabled={saving} className="premium-btn premium-btn-primary">
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
