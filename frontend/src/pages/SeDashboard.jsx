import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSeDashboard } from '../api/dashboard';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

// ---- Stat Card Component ----
const StatCard = ({ title, value, subtitle, color, icon, linkTo }) => {
  const card = (
    <div className="dash-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="dash-stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="dash-stat-body">
        <div className="dash-stat-value" style={{ color }}>
          {value}
        </div>
        <div className="dash-stat-title">{title}</div>
        {subtitle && <div className="dash-stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} style={{ textDecoration: 'none' }}>{card}</Link>;
  }
  return card;
};

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
    <Link to={`/follow-ups/${fu._id}/edit`} className="dash-followup-row" style={{ borderLeft: `3px solid ${isOverdue ? '#e74c3c' : statusColors[fu.status] || '#aaa'}` }}>
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
    </Link>
  );
};

// ---- Interaction Row ----
const InteractionRow = ({ interaction }) => {
  const typeColors = {
    'Call': '#3498db',
    'Email': '#9b59b6',
    'Meeting': '#e67e22'
  };
  const typeIcons = {
    'Call': '📞',
    'Email': '✉️',
    'Meeting': '🤝'
  };

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

// ---- Main SE Dashboard ----
const SeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getSeDashboard();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="dash-error">⚠️ {error}</div>;
  }

  const { summary, upcomingFollowUps, activeFollowUps, recentInteractions } = data;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">My Dashboard</h1>
          <p className="dash-subtitle">Welcome back, <strong>{user?.name}</strong> — here's your activity summary</p>
        </div>
        <div className="dash-quick-actions">
          <Link to="/follow-ups/new" className="premium-btn premium-btn-primary">+ New Follow-up</Link>
          <Link to="/interactions/new" className="premium-btn premium-btn-secondary">+ Log Interaction</Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="dash-stats-grid">
        <StatCard
          title="My Customers"
          value={summary.customerCount}
          subtitle="Assigned accounts"
          color="#6c63ff"
          icon="👥"
          linkTo="/customers"
        />
        <StatCard
          title="Pending Follow-ups"
          value={summary.followUps.pending}
          subtitle="Waiting for action"
          color="#f39c12"
          icon="⏳"
          linkTo="/follow-ups?status=Pending"
        />
        <StatCard
          title="Overdue"
          value={summary.followUps.overdue}
          subtitle={summary.followUps.overdue > 0 ? 'Requires immediate attention' : 'You\'re up to date!'}
          color={summary.followUps.overdue > 0 ? '#e74c3c' : '#2ecc71'}
          icon={summary.followUps.overdue > 0 ? '🔴' : '✅'}
          linkTo="/follow-ups?status=Pending"
        />
        <StatCard
          title="In Progress"
          value={summary.followUps.inProgress}
          subtitle="Active follow-ups"
          color="#3498db"
          icon="🔄"
          linkTo="/follow-ups?status=In Progress"
        />
        <StatCard
          title="Completed"
          value={summary.followUps.completed}
          subtitle="All time completions"
          color="#2ecc71"
          icon="✔️"
          linkTo="/follow-ups?status=Completed"
        />
        <StatCard
          title="Interactions"
          value={summary.interactionCount}
          subtitle="Total logged"
          color="#9b59b6"
          icon="💬"
          linkTo="/interactions"
        />
      </div>

      {/* Main Content Area */}
      <div className="dash-main-grid">
        {/* Active / Upcoming Follow-ups */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">📅</span>
              Upcoming Follow-ups
              <span className="dash-panel-badge">{upcomingFollowUps.length}</span>
            </h3>
            <Link to="/follow-ups" className="dash-panel-link">View all →</Link>
          </div>
          <div className="dash-panel-body">
            {upcomingFollowUps.length === 0 ? (
              <div className="dash-empty">
                <span>🎉</span>
                <p>No upcoming follow-ups in the next 7 days.</p>
                <Link to="/follow-ups/new" className="premium-btn premium-btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  Schedule One
                </Link>
              </div>
            ) : (
              upcomingFollowUps.map(fu => <FollowUpRow key={fu._id} fu={fu} />)
            )}
          </div>
        </div>

        {/* Active (Pending/In Progress) Follow-ups — oldest first */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">🔥</span>
              Active Follow-ups
              <span className="dash-panel-badge" style={{ background: '#e74c3c20', color: '#e74c3c' }}>
                {summary.followUps.pending + summary.followUps.inProgress}
              </span>
            </h3>
            <Link to="/follow-ups" className="dash-panel-link">View all →</Link>
          </div>
          <div className="dash-panel-body">
            {activeFollowUps.length === 0 ? (
              <div className="dash-empty">
                <span>✅</span>
                <p>No active follow-ups. All caught up!</p>
              </div>
            ) : (
              activeFollowUps.map(fu => <FollowUpRow key={fu._id} fu={fu} />)
            )}
          </div>
        </div>
      </div>

      {/* Recent Interactions */}
      <div className="dash-panel dash-panel-wide">
        <div className="dash-panel-header">
          <h3 className="dash-panel-title">
            <span className="dash-panel-icon">💬</span>
            Recent Interactions
          </h3>
          <Link to="/interactions" className="dash-panel-link">View all →</Link>
        </div>
        <div className="dash-panel-body">
          {recentInteractions.length === 0 ? (
            <div className="dash-empty">
              <span>📋</span>
              <p>No interactions logged yet.</p>
              <Link to="/interactions/new" className="premium-btn premium-btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}>
                Log First Interaction
              </Link>
            </div>
          ) : (
            recentInteractions.map(i => <InteractionRow key={i._id} interaction={i} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default SeDashboard;
