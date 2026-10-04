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
          <h2>Follow-ups Kanban</h2>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>
            {user?.role === 'admin' ? 'System-wide follow-ups' : 'Manage your assigned follow-ups'}
          </p>
        </div>
        <Link to="/follow-ups/new" className="premium-btn premium-btn-primary">
          + Add Follow-up
        </Link>
      </div>

      <div className="premium-card">
        {error && <div style={{ color: '#ff4757', marginBottom: '16px' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading follow-ups...</div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {['Pending', 'In Progress', 'Completed'].map(status => (
              <div key={status} style={{ flex: '1', minWidth: '300px', background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ borderBottom: `3px solid ${getStatusColor(status).color}`, paddingBottom: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  {status} 
                  <span style={{ background: '#e2e8f0', color: '#64748b', borderRadius: '12px', padding: '2px 8px', fontSize: '0.8rem' }}>
                    {followUps.filter(f => f.status === status).length}
                  </span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {followUps.filter(f => f.status === status).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0', fontSize: '0.9rem' }}>No {status} follow-ups</div>
                  ) : (
                    followUps.filter(f => f.status === status).map(fu => (
                      <div key={fu._id} style={{ background: '#fff', borderRadius: '6px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${fu.isOverdue ? '#ff4757' : getStatusColor(status).color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Link to={`/customers/${fu.customer?._id}`} style={{ fontWeight: '600', color: 'var(--accent)', textDecoration: 'none' }}>
                            {fu.customer?.name || 'Unknown'}
                          </Link>
                          {fu.isOverdue && <span style={{ fontSize: '10px', color: '#ff4757', border: '1px solid #ff4757', borderRadius: '3px', padding: '1px 3px' }}>OVERDUE</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '8px' }}>
                          📅 {formatDate(fu.date)}
                        </div>
                        {fu.notes && (
                          <div style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '12px', padding: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                            {fu.notes}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #edf2f7', paddingTop: '8px' }}>
                          
                          {/* Quick Actions / Move Next */}
                          <div>
                            {status === 'Pending' && (
                              <button onClick={() => handleStatusChange(fu._id, 'In Progress')} className="premium-btn premium-btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }}>Move to In Progress ➔</button>
                            )}
                            {status === 'In Progress' && (
                              <button onClick={() => handleStatusChange(fu._id, 'Completed')} className="premium-btn premium-btn-primary" style={{ padding: '4px 8px', fontSize: '11px', background: '#2ecc71', color: 'white', marginRight: '4px' }}>Complete ✓</button>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Link to={`/follow-ups/${fu._id}/edit`} className="premium-btn premium-btn-secondary" style={{ padding: '4px', fontSize: '12px' }} title="Edit">✏️</Link>
                            <button onClick={() => handleDelete(fu._id)} className="premium-btn premium-btn-danger" style={{ padding: '4px', fontSize: '12px' }} title="Delete">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpsList;
