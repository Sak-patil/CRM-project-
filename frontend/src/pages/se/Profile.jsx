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
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>My Profile</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        <strong>Email:</strong> {user?.email} <br />
        <strong>Role:</strong> {user?.role === 'admin' ? 'Administrator' : 'Sales Executive'}
      </p>
      
      {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
      {success && <div style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}
      
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

        <div style={{ marginTop: '10px' }}>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
