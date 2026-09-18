import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInteractions, deleteInteraction } from '../api/interactions';
import { useAuth } from '../hooks/useAuth';

const InteractionsList = () => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('');

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      
      const response = await getInteractions(params);
      setInteractions(response.data.interactions);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch interactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, [typeFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await deleteInteraction(id);
        setInteractions(interactions.filter(i => i._id !== id));
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete interaction');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Call': return '#3498db'; // blue
      case 'Email': return '#9b59b6'; // purple
      case 'Meeting': return '#e67e22'; // orange
      default: return 'var(--text)';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header flex-between">
        <div>
          <h2>Interactions History</h2>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>
            {user?.role === 'admin' ? 'System-wide interactions' : 'Your logged interactions'}
          </p>
        </div>
        <Link to="/interactions/new" className="premium-btn premium-btn-primary">
          + Log Interaction
        </Link>
      </div>

      {error && <div style={{ color: '#ff4757', marginBottom: '15px' }}>{error}</div>}

      <div className="premium-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          >
            <option value="">All Types</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
          </select>
        </div>
      </div>

      <div className="premium-card">
        {loading ? (
          <p>Loading interactions...</p>
        ) : interactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text)', padding: '20px' }}>No interactions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text)' }}>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Summary</th>
                  <th style={{ padding: '12px' }}>Logged By</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interactions.map(interaction => (
                  <tr key={interaction._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#fff',
                        backgroundColor: getTypeColor(interaction.type)
                      }}>
                        {interaction.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link to={`/customers/${interaction.customer?._id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
                        {interaction.customer?.name || 'Unknown'}
                      </Link>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text)' }}>
                      {formatDate(interaction.date)}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-h)' }}>
                      {interaction.summary}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text)' }}>
                      {interaction.createdBy?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <Link 
                        to={`/interactions/${interaction._id}/edit`} 
                        className="premium-btn" 
                        style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px', background: 'transparent', color: 'var(--accent)' }}
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(interaction._id)}
                        className="premium-btn"
                        style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', color: '#ff4757', border: '1px solid #ff4757' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionsList;
