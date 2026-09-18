import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCustomer, createCustomer, updateCustomer } from '../api/customers';
import { getUsers } from '../api/users';
import { useAuth } from '../hooks/useAuth';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    assignedTo: '' // Used by Admin only
  });
  
  const [salesExecutives, setSalesExecutives] = useState([]);
  const [loading, setLoading] = useState(isEditing || user?.role === 'admin');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // If admin, fetch SEs for the assignment dropdown
        if (user?.role === 'admin') {
          const seResponse = await getUsers();
          setSalesExecutives(seResponse.data.users);
        }

        if (isEditing) {
          const data = await getCustomer(id);
          const customer = data.data.customer;
          setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            assignedTo: customer.assignedTo?._id || ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, user?.role]);

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
        await updateCustomer(id, formData);
      } else {
        await createCustomer(formData);
      }
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading form data...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header flex-between">
        <h2>{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
        <Link to="/customers" className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px' }}>
          Back to List
        </Link>
      </div>
      
      {error && <div style={{ color: '#ff4757', marginBottom: '15px', padding: '10px', background: '#ffeaa7', borderRadius: '8px' }}>{error}</div>}
      
      <div className="premium-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="premium-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp Contact"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="premium-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. contact@acme.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number *</label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="premium-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1234567890"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea
              id="address"
              name="address"
              className="premium-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full physical or mailing address"
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>

          {user?.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="assignedTo" className="form-label">Assign to Sales Executive *</label>
              <select
                id="assignedTo"
                name="assignedTo"
                className="premium-input"
                value={formData.assignedTo}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a Sales Executive</option>
                {salesExecutives.map(se => (
                  <option key={se._id} value={se._id}>
                    {se.name} ({se.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-row" style={{ marginTop: '30px' }}>
            <button type="submit" disabled={saving} className="premium-btn premium-btn-primary" style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Save Customer'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/customers')}
              className="premium-btn premium-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
