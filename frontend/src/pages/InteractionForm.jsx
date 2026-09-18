import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { getInteraction, createInteraction, updateInteraction } from '../api/interactions';
import { getCustomers } from '../api/customers';
import { useAuth } from '../hooks/useAuth';

const InteractionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customer');
  
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    customer: customerIdParam || '',
    type: 'Call',
    date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm format for datetime-local
    summary: '',
    notes: '',
    duration: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch customers for the dropdown
        const custRes = await getCustomers();
        setCustomers(custRes.data.customers);

        // If editing, fetch interaction data
        if (isEditMode) {
          const intRes = await getInteraction(id);
          const interaction = intRes.data.interaction;
          
          setFormData({
            customer: interaction.customer._id || interaction.customer,
            type: interaction.type,
            date: new Date(interaction.date).toISOString().slice(0, 16),
            summary: interaction.summary,
            notes: interaction.notes || '',
            duration: interaction.duration || ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = { ...formData };
      
      // Clean up empty duration
      if (!payload.duration) {
        delete payload.duration;
      } else {
        payload.duration = Number(payload.duration);
      }

      if (isEditMode) {
        await updateInteraction(id, payload);
      } else {
        await createInteraction(payload);
      }
      navigate(payload.customer ? `/customers/${payload.customer}` : '/interactions');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h2>{isEditMode ? 'Edit Interaction' : 'Log New Interaction'}</h2>
        <button onClick={() => navigate(-1)} className="premium-btn" style={{ background: 'transparent', color: 'var(--text)' }}>
          Cancel
        </button>
      </div>

      {error && <div style={{ color: '#ff4757', marginBottom: '20px', padding: '10px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '8px' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontSize: '14px' }}>Customer *</label>
          <select
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            disabled={isEditMode} // Cannot change customer once logged
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontSize: '14px' }}>Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
            >
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontSize: '14px' }}>Date & Time *</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontSize: '14px' }}>Summary * (Headline)</label>
          <input
            type="text"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            placeholder="e.g., Initial intro call, Q3 planning meeting"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontSize: '14px' }}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Detailed meeting notes, action items, etc."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)', resize: 'vertical' }}
          ></textarea>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontSize: '14px' }}>Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 30"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="premium-btn premium-btn-primary" 
          style={{ width: '100%', marginTop: '10px' }}
        >
          {submitting ? 'Saving...' : isEditMode ? 'Update Interaction' : 'Log Interaction'}
        </button>
      </form>
    </div>
  );
};

export default InteractionForm;
