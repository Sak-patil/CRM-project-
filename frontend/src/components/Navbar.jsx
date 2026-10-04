import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Icon = ({ name }) => {
  const paths = {
    overview: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    customers: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    followups: 'M3 5h18M6 3v4M18 3v4M5 11h14M5 15h9M4 5h16v16H4z',
    activity: 'M3 12h4l3-8 4 16 3-8h4',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    profile: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    logout: 'M10 17l5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6'
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';
  const navigation = [['/dashboard', 'Overview', 'overview', true], ['/customers', 'Customers', 'customers'], ['/follow-ups', 'Follow-ups', 'followups'], ['/interactions', 'Interactions', 'activity'], ...(user?.role === 'admin' ? [['/admin/users', 'Team', 'users']] : [])];
  const handleLogout = () => { logout(); navigate('/login'); };

  return <aside className="app-sidebar">
    <div className="sidebar-brand" aria-label="ClientFlow CRM"><span className="brand-mark">C</span><span>ClientFlow</span></div>
    <div className="sidebar-workspace">WORKSPACE</div>
    <nav className="sidebar-nav" aria-label="Primary navigation">
      {navigation.map(([to, label, icon, exact]) => <NavLink key={to} to={to} end={exact} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}><Icon name={icon} /><span>{label}</span></NavLink>)}
    </nav>
    <div className="sidebar-footer">
      <NavLink to="/se/profile" className={({ isActive }) => `account-row${isActive ? ' active' : ''}`}><span className="account-avatar">{initial}</span><span className="account-copy"><strong>{user?.name || 'Account'}</strong><small>{user?.role === 'admin' ? 'Administrator' : 'Sales executive'}</small></span><Icon name="profile" /></NavLink>
      <button type="button" className="sidebar-logout" onClick={handleLogout}><Icon name="logout" /><span>Sign out</span></button>
    </div>
  </aside>;
};

export default Navbar;
