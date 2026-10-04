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
    <div className="content-page" style={{ padding: '28px 32px' }}>
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

      <div className="premium-card filter-card">
        <div className="filter-row">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
          </select>
        </div>
      </div>

      <div className="premium-card list-card">
        {loading ? (
          <p>Loading interactions...</p>
        ) : interactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text)', padding: '20px' }}>No interactions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Type</th><th>Customer</th><th>Date</th><th>Summary</th><th>Logged By</th><th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interactions.map(interaction => (
                  <tr key={interaction._id}>
                    <td>
                      <span className="type-badge" style={{ color: getTypeColor(interaction.type), backgroundColor: `${getTypeColor(interaction.type)}18` }}>
                        {interaction.type}
                      </span>
                    </td>
                    <td>
                      <Link to={`/customers/${interaction.customer?._id}`} className="table-primary-link">
                        {interaction.customer?.name || 'Unknown'}
                      </Link>
                    </td>
                    <td className="muted-cell">
                      {formatDate(interaction.date)}
                    </td>
                    <td className="summary-cell">
                      {interaction.summary}
                    </td>
                    <td className="muted-cell">
                      {interaction.createdBy?.name || 'Unknown'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link 
                        to={`/interactions/${interaction._id}/edit`} 
                        className="inline-action"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(interaction._id)}
                        className="inline-action danger-action"
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
