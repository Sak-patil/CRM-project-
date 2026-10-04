import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSeDashboard } from '../../api/dashboard';
import api from '../../api/axiosInstance'; // to fetch SE name if needed
import '../Dashboard.css';

// ---- Stat Card Component ----
const StatCard = ({ title, value, subtitle, color, icon }) => (
  <div className="dash-stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div className="dash-stat-icon" style={{ background: `${color}20`, color }}>{icon}</div>
    <div className="dash-stat-body">
      <div className="dash-stat-value" style={{ color }}>{value}</div>
      <div className="dash-stat-title">{title}</div>
      {subtitle && <div className="dash-stat-subtitle">{subtitle}</div>}
    </div>
  </div>
);

// ---- Follow-up Row ----
const FollowUpRow = ({ fu }) => {
  const now = new Date();
  const isOverdue = fu.isOverdue || (new Date(fu.date) < now && (fu.status === 'Pending' || fu.status === 'In Progress'));

  const statusColors = {
    'Pending': '#f39c12',
    'In Progress': '#3498db',
    'Completed': '#2ecc71',
    'Cancelled': '#e74c3c'
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dash-followup-row" style={{ borderLeft: `3px solid ${isOverdue ? '#e74c3c' : statusColors[fu.status] || '#aaa'}` }}>
      <div className="dash-followup-info">
        <span className="dash-followup-customer">{fu.customer?.name || 'Unknown'}</span>
        {fu.notes && <span className="dash-followup-notes">{fu.notes}</span>}
      </div>
      <div className="dash-followup-meta">
        <span className="dash-followup-date" style={{ color: isOverdue ? '#e74c3c' : 'var(--text)' }}>
          {formatDate(fu.date)}
          {isOverdue && <span className="dash-overdue-badge">OVERDUE</span>}
        </span>
        <span className="dash-status-pill" style={{ background: `${statusColors[fu.status]}20`, color: statusColors[fu.status] }}>
          {fu.status}
        </span>
      </div>
    </div>
  );
};

// ---- Interaction Row ----
const InteractionRow = ({ interaction }) => {
  const typeColors = { 'Call': '#3498db', 'Email': '#9b59b6', 'Meeting': '#e67e22' };
  const typeIcons = { 'Call': '📞', 'Email': '✉️', 'Meeting': '🤝' };
  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="dash-interaction-row">
      <div className="dash-interaction-icon" style={{ background: `${typeColors[interaction.type]}20`, color: typeColors[interaction.type] }}>
        {typeIcons[interaction.type] || '📋'}
      </div>
      <div className="dash-interaction-body">
        <div className="dash-interaction-summary">{interaction.summary}</div>
        <div className="dash-interaction-meta">
          <span style={{ color: typeColors[interaction.type], fontWeight: '600' }}>{interaction.type}</span>
          {' · '}
          <span>{interaction.customer?.name || 'Unknown'}</span>
          {interaction.duration && <span> · {interaction.duration} min</span>}
        </div>
      </div>
      <div className="dash-interaction-date">{formatDate(interaction.date)}</div>
    </div>
  );
};

// ---- Main SE Progress View ----
const SeProgressView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [seUser, setSeUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch SE Dashboard data for this specific user
        const res = await getSeDashboard(id);
        setData(res.data.data);
        
        // Try to fetch the user details to get their name
        const userRes = await api.get(`/users/${id}`);
        setSeUser(userRes.data.data.user);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading Sales Executive progress...</p>
      </div>
    );
  }

  if (error) return <div className="dash-error">⚠️ {error}</div>;
  if (!data) return null;

  const { summary, upcomingFollowUps, activeFollowUps, recentInteractions } = data;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">{seUser ? `${seUser.name}'s Progress` : 'Sales Executive Progress'}</h1>
          <p className="dash-subtitle">Viewing performance metrics and assigned accounts</p>
        </div>
        <div className="dash-quick-actions">
          <Link to="/" className="premium-btn premium-btn-secondary">← Back to Dashboard</Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="dash-stats-grid">
        <StatCard title="Assigned Customers" value={summary.customerCount} subtitle="Total accounts" color="#6c63ff" icon="👥" />
        <StatCard title="Pending Follow-ups" value={summary.followUps.pending} subtitle="Waiting for action" color="#f39c12" icon="⏳" />
        <StatCard title="Overdue" value={summary.followUps.overdue} subtitle={summary.followUps.overdue > 0 ? 'Requires attention' : 'Up to date'} color={summary.followUps.overdue > 0 ? '#e74c3c' : '#2ecc71'} icon={summary.followUps.overdue > 0 ? '🔴' : '✅'} />
        <StatCard title="In Progress" value={summary.followUps.inProgress} subtitle="Active follow-ups" color="#3498db" icon="🔄" />
        <StatCard title="Completed" value={summary.followUps.completed} subtitle="All time completions" color="#2ecc71" icon="✔️" />
        <StatCard title="Interactions" value={summary.interactionCount} subtitle="Total logged" color="#9b59b6" icon="💬" />
      </div>

      {/* Main Content Area */}
      <div className="dash-main-grid">
        {/* Upcoming Follow-ups */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">📅</span> Upcoming Follow-ups
              <span className="dash-panel-badge">{upcomingFollowUps.length}</span>
            </h3>
          </div>
          <div className="dash-panel-body">
            {upcomingFollowUps.length === 0 ? (
              <div className="dash-empty"><span>🎉</span><p>No upcoming follow-ups.</p></div>
            ) : (
              upcomingFollowUps.map(fu => <FollowUpRow key={fu._id} fu={fu} />)
            )}
          </div>
        </div>

        {/* Active Follow-ups */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">🔥</span> Active Follow-ups
              <span className="dash-panel-badge" style={{ background: '#e74c3c20', color: '#e74c3c' }}>
                {summary.followUps.pending + summary.followUps.inProgress}
              </span>
            </h3>
          </div>
          <div className="dash-panel-body">
            {activeFollowUps.length === 0 ? (
              <div className="dash-empty"><span>✅</span><p>No active follow-ups.</p></div>
            ) : (
              activeFollowUps.map(fu => <FollowUpRow key={fu._id} fu={fu} />)
            )}
          </div>
        </div>
      </div>

      {/* Recent Interactions & Customers List */}
      <div className="dash-main-grid" style={{ marginTop: '24px' }}>
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title"><span className="dash-panel-icon">💬</span> Recent Interactions</h3>
          </div>
          <div className="dash-panel-body">
            {recentInteractions.length === 0 ? (
              <div className="dash-empty"><span>📋</span><p>No interactions logged yet.</p></div>
            ) : (
              recentInteractions.map(i => <InteractionRow key={i._id} interaction={i} />)
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title"><span className="dash-panel-icon">👥</span> Assigned Customers</h3>
            <span className="dash-panel-badge" style={{ background: '#6c63ff20', color: '#6c63ff' }}>{data.customers?.length || 0}</span>
          </div>
          <div className="dash-panel-body">
            {!data.customers || data.customers.length === 0 ? (
              <div className="dash-empty"><span>👥</span><p>No customers assigned.</p></div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.customers.map(c => (
                  <li key={c._id} style={{ padding: '12px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Link to={`/customers/${c._id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem' }}>
                      {c.name}
                    </Link>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{c.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeProgressView;
