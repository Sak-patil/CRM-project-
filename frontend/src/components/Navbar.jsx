import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ padding: '10px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="navbar-brand">
        <h2>CRM System</h2>
      </div>
      <div className="navbar-links">
        <Link to="/" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/customers" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>Customers</Link>
        <Link to="/follow-ups" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>Follow-ups</Link>
        <Link to="/interactions" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>Interactions</Link>
        {user?.role === 'admin' && (
          <Link to="/admin/users" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>Users</Link>
        )}
        <Link to="/se/profile" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>Profile</Link>
      </div>
      <div className="navbar-user">
        <span style={{ marginRight: '15px' }}>
          {user?.name} ({user?.role})
        </span>
        <button onClick={handleLogout} style={{ padding: '5px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
