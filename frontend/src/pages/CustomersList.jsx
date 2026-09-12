import { useState, useEffect } from 'react';
import { getCustomers } from '../api/customers';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getCustomers();
        setCustomers(response.data.customers);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading customers...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Customers</h2>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Phone</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{customer.name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{customer.email}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{customer.phone}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {customer.assignedTo?.name || 'Unassigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomersList;
