import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getFollowUps, updateFollowUpStatus, deleteFollowUp } from '../api/followUps';
import { useAuth } from '../hooks/useAuth';

const FollowUpsList = () => {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await getFollowUps(params);
      setFollowUps(response.data.followUps);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch follow-ups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateFollowUpStatus(id, newStatus);
      fetchFollowUps(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this follow-up?')) {
      try {
        await deleteFollowUp(id);
        fetchFollowUps();
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete follow-up');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return { bg: '#ffeaa7', color: '#d63031' }; // Highlight overdue
    switch(status) {
      case 'Pending': return { bg: '#f1f2f6', color: '#57606f' };
      case 'In Progress': return { bg: '#eccc68', color: '#2f3542' };
      case 'Completed': return { bg: '#7bed9f', color: '#2f3542' };
      case 'Cancelled': return { bg: '#ff6b81', color: '#ffffff' };
      default: return { bg: '#f1f2f6', color: '#57606f' };
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header flex-between">
        <div>
          <h2>Follow-ups</h2>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>
            {user?.role === 'admin' ? 'System-wide follow-ups' : 'Manage your assigned follow-ups'}
          </p>
        </div>
        <Link to="/follow-ups/new" className="premium-btn premium-btn-primary">
          + Add Follow-up
        </Link>
      </div>

      <div className="premium-card">
        <div className="flex-row" style={{ marginBottom: '20px', gap: '15px' }}>
          <select 
            className="premium-input" 
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {error && <div style={{ color: '#ff4757', marginBottom: '16px' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading follow-ups...</div>
        ) : followUps.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text)' }}>
            No follow-ups found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((fu) => {
                  const colors = getStatusColor(fu.status, fu.isOverdue);
                  return (
                    <tr key={fu._id} style={fu.isOverdue ? { backgroundColor: 'rgba(255, 71, 87, 0.05)' } : {}}>
                      <td style={{ fontWeight: fu.isOverdue ? 'bold' : 'normal', color: fu.isOverdue ? '#ff4757' : 'inherit' }}>
                        {formatDate(fu.date)}
                        {fu.isOverdue && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#ff4757', border: '1px solid #ff4757', borderRadius: '4px', padding: '2px 4px' }}>OVERDUE</span>}
                      </td>
                      <td>
                        <Link to={`/customers/${fu.customer?._id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
                          {fu.customer?.name || 'Unknown'}
                        </Link>
                      </td>
                      <td>
                        <span style={{ 
                          background: colors.bg, 
                          color: colors.color,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {fu.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fu.notes || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                          
                          {/* Quick status actions for Pending/In Progress */}
                          {(fu.status === 'Pending' || fu.status === 'In Progress') && (
                            <select 
                              className="premium-input"
                              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '110px' }}
                              value={fu.status}
                              onChange={(e) => handleStatusChange(fu._id, e.target.value)}
                            >
                              <option value="Pending" disabled={fu.status !== 'Pending'}>Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}

                          {((fu.status !== 'Completed' && fu.status !== 'Cancelled') || user?.role === 'admin') && (
                            <Link to={`/follow-ups/${fu._id}/edit`} className="premium-btn premium-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                              Edit
                            </Link>
                          )}
                          
                          <button 
                            onClick={() => handleDelete(fu._id)}
                            className="premium-btn premium-btn-danger" 
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpsList;
