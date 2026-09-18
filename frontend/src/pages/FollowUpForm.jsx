import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { getFollowUp, createFollowUp, updateFollowUp } from '../api/followUps';
import { getCustomers } from '../api/customers';
import { useAuth } from '../hooks/useAuth';

const FollowUpForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCustomerId = searchParams.get('customer') || '';
  
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    customer: defaultCustomerId,
    date: '',
    status: 'Pending',
    notes: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Format date for datetime-local input
  const formatForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // Fetch customers for the dropdown
        const custResponse = await getCustomers();
        setCustomers(custResponse.data.customers);

        if (isEditing) {
          const data = await getFollowUp(id);
          const followUp = data.data.followUp;
          setFormData({
            customer: followUp.customer?._id || '',
            date: formatForInput(followUp.date),
            status: followUp.status,
            notes: followUp.notes || ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id]);

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
        // Can only update date and notes
        const updateData = {
          date: formData.date,
          notes: formData.notes
        };
        await updateFollowUp(id, updateData);
      } else {
        await createFollowUp(formData);
      }
      
      // If we came from a specific customer, go back there
      if (defaultCustomerId) {
        navigate(`/customers/${defaultCustomerId}`);
      } else {
        navigate('/follow-ups');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save follow-up');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading form data...</div>;

  const isTerminalState = isEditing && (formData.status === 'Completed' || formData.status === 'Cancelled');
  const readOnlyFields = isTerminalState && user?.role !== 'admin';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header flex-between">
        <h2>{isEditing ? 'Edit Follow-up' : 'Add New Follow-up'}</h2>
        <button onClick={() => navigate(-1)} className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px' }}>
          Back
        </button>
      </div>
      
      {error && <div style={{ color: '#ff4757', marginBottom: '15px', padding: '10px', background: '#ffeaa7', borderRadius: '8px' }}>{error}</div>}
      
      {readOnlyFields && (
        <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '8px', color: '#ff4757', fontSize: '14px' }}>
          This follow-up is {formData.status}. Only Administrators can edit terminal follow-ups.
        </div>
      )}

      <div className="premium-card">
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="customer" className="form-label">Customer *</label>
            <select
              id="customer"
              name="customer"
              className="premium-input"
              value={formData.customer}
              onChange={handleChange}
              disabled={isEditing || readOnlyFields}
              required
            >
              <option value="" disabled>Select a Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="date" className="form-label">Date & Time *</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              className="premium-input"
              value={formData.date}
              onChange={handleChange}
              disabled={readOnlyFields}
              required
            />
          </div>

          {!isEditing && (
            <div className="form-group">
              <label htmlFor="status" className="form-label">Initial Status</label>
              <select
                id="status"
                name="status"
                className="premium-input"
                value={formData.status}
                onChange={handleChange}
                disabled={readOnlyFields}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="premium-input"
              value={formData.notes}
              onChange={handleChange}
              disabled={readOnlyFields}
              placeholder="Enter details about this follow-up..."
              rows="4"
              style={{ resize: 'vertical' }}
            />
          </div>

          {!readOnlyFields && (
            <div className="flex-row" style={{ marginTop: '30px' }}>
              <button type="submit" disabled={saving} className="premium-btn premium-btn-primary" style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save Follow-up'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="premium-btn premium-btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FollowUpForm;
