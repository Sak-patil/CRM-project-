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
    <div className="content-page" style={{ padding: '28px 32px' }}>
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

      <div className="premium-card kanban-shell">
        {error && <div style={{ color: '#ff4757', marginBottom: '16px' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading follow-ups...</div>
        ) : (
          <div className="kanban-board">
            {['Pending', 'In Progress', 'Completed'].map(status => (
              <div key={status} className="kanban-column">
                <h3 className="kanban-title" style={{ borderBottomColor: getStatusColor(status).color }}>
                  {status} 
                  <span className="kanban-count">
                    {followUps.filter(f => f.status === status).length}
                  </span>
                </h3>
                
                <div className="kanban-cards">
                  {followUps.filter(f => f.status === status).length === 0 ? (
                    <div className="kanban-empty">No {status.toLowerCase()} follow-ups</div>
                  ) : (
                    followUps.filter(f => f.status === status).map(fu => (
                      <div key={fu._id} className="followup-card" style={{ borderLeftColor: fu.isOverdue ? '#b42318' : getStatusColor(status).color }}>
                        <div className="followup-card-top">
                          <Link to={`/customers/${fu.customer?._id}`} className="table-primary-link">
                            {fu.customer?.name || 'Unknown'}
                          </Link>
                          {fu.isOverdue && <span className="overdue-label">Overdue</span>}
                        </div>
                        <div className="followup-date">
                          Due {formatDate(fu.date)}
                        </div>
                        {fu.notes && (
                          <div className="followup-notes">
                            {fu.notes}
                          </div>
                        )}
                        <div className="followup-actions">
                          
                          {/* Quick Actions / Move Next */}
                          <div>
                            {status === 'Pending' && (
                              <button onClick={() => handleStatusChange(fu._id, 'In Progress')} className="premium-btn premium-btn-secondary compact-button">Start</button>
                            )}
                            {status === 'In Progress' && (
                              <button onClick={() => handleStatusChange(fu._id, 'Completed')} className="premium-btn premium-btn-primary compact-button complete-button">Complete</button>
                            )}
                          </div>
                          
                          <div className="followup-actions-right">
                            <Link to={`/follow-ups/${fu._id}/edit`} className="inline-action">Edit</Link>
                            <button onClick={() => handleDelete(fu._id)} className="inline-action danger-action">Delete</button>
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
