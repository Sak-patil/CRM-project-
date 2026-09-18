import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomer, deleteCustomer } from '../api/customers';
import { getFollowUps } from '../api/followUps';
import { useAuth } from '../hooks/useAuth';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const [customerData, followUpsData] = await Promise.all([
          getCustomer(id),
          getFollowUps({ customer: id })
        ]);
        setCustomer(customerData.data.customer);
        setFollowUps(followUpsData.data.followUps);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?\n\nWARNING: This will permanently delete this customer and all associated follow-ups and interactions.`)) {
      try {
        await deleteCustomer(id);
        navigate('/customers');
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete customer');
      }
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading customer details...</div>;
  if (error) return <div style={{ padding: '20px', color: '#ff4757', textAlign: 'center' }}>{error}</div>;
  if (!customer) return <div style={{ padding: '20px', textAlign: 'center' }}>Customer not found.</div>;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header flex-between">
        <div>
          <h2>Customer Details</h2>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>
            Detailed view and activity history for {customer.name}
          </p>
        </div>
        <div className="flex-row">
          <Link to="/customers" className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px' }}>
            Back to List
          </Link>
          <Link to={`/customers/${id}/edit`} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px' }}>
            Edit
          </Link>
          {user?.role === 'admin' && (
            <button onClick={handleDelete} className="premium-btn premium-btn-danger" style={{ padding: '6px 12px' }}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="premium-card">
          <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            Contact Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-h)' }}>{customer.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</div>
              <div style={{ fontSize: '16px', color: 'var(--text-h)' }}>
                <a href={`mailto:${customer.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  {customer.email}
                </a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</div>
              <div style={{ fontSize: '16px', color: 'var(--text-h)' }}>
                <a href={`tel:${customer.phone}`} style={{ color: 'var(--text-h)', textDecoration: 'none' }}>
                  {customer.phone}
                </a>
              </div>
            </div>
            {customer.address && (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</div>
                <div style={{ fontSize: '16px', color: 'var(--text-h)' }}>{customer.address}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned To</div>
              <div style={{ 
                display: 'inline-block',
                marginTop: '4px',
                background: 'var(--social-bg)', 
                color: 'var(--text-h)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                border: '1px solid var(--border)'
              }}>
                {customer.assignedTo?.name || 'Unassigned'}
              </div>
            </div>
          </div>
        </div>

        {/* Follow-ups and Interactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="premium-card">
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Follow-ups</h3>
              <Link to={`/follow-ups/new?customer=${id}`} className="premium-btn premium-btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                + Add
              </Link>
            </div>
            
            {followUps.length === 0 ? (
              <p style={{ color: 'var(--text)', fontSize: '14px', textAlign: 'center' }}>
                No follow-ups for this customer.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {followUps.map(fu => (
                  <li key={fu._id} style={{ 
                    padding: '10px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    background: fu.isOverdue ? 'rgba(255, 71, 87, 0.05)' : 'var(--bg)',
                    borderColor: fu.isOverdue ? '#ff4757' : 'var(--border)'
                  }}>
                    <div className="flex-between" style={{ marginBottom: '5px' }}>
                      <strong style={{ fontSize: '14px', color: fu.isOverdue ? '#ff4757' : 'var(--text-h)' }}>
                        {formatDate(fu.date)}
                        {fu.isOverdue && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#ff4757', color: '#fff', padding: '2px 4px', borderRadius: '4px' }}>OVERDUE</span>}
                      </strong>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)' }}>{fu.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)' }}>{fu.notes || 'No notes'}</p>
                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                       <Link to={`/follow-ups/${fu._id}/edit`} style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>Edit</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--social-bg)', borderStyle: 'dashed' }}>
            <h3 style={{ color: 'var(--text)' }}>Interactions (Phase 10)</h3>
            <p style={{ color: 'var(--text)', fontSize: '14px', textAlign: 'center' }}>
              History of calls, emails, and meetings will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
