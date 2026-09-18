import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../api/customers';
import { useAuth } from '../hooks/useAuth';

const CustomersList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await getCustomers(params);
      setCustomers(response.data.customers);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?\n\nWARNING: This will permanently delete this customer and all associated follow-ups and interactions.`)) {
      try {
        await deleteCustomer(id);
        fetchCustomers(); // refresh list
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete customer');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header flex-between">
        <div>
          <h2>Customers</h2>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>
            {user?.role === 'admin' ? 'Manage all customers across the system' : 'Manage your assigned customers'}
          </p>
        </div>
        <Link to="/customers/new" className="premium-btn premium-btn-primary">
          + Add Customer
        </Link>
      </div>

      <div className="premium-card">
        <div className="flex-row" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="premium-input search-bar"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <div style={{ color: '#ff4757', marginBottom: '16px' }}>{error}</div>}

        {loading && !customers.length ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading customers...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text)' }}>
            No customers found. {searchTerm && 'Try a different search term.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  {user?.role === 'admin' && <th>Assigned To</th>}
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td style={{ fontWeight: '500' }}>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    {user?.role === 'admin' && (
                      <td>
                        <span style={{ 
                          background: 'var(--accent-bg)', 
                          color: 'var(--accent)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {customer.assignedTo?.name || 'Unassigned'}
                        </span>
                      </td>
                    )}
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                        <Link to={`/customers/${customer._id}`} className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          View
                        </Link>
                        <Link to={`/customers/${customer._id}/edit`} className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          Edit
                        </Link>
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => handleDelete(customer._id, customer.name)}
                            className="premium-btn premium-btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
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

export default CustomersList;
