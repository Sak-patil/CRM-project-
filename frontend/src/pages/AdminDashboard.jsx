import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../api/dashboard';
import './Dashboard.css';

// ---- Reusable Stat Card ----
const StatCard = ({ title, value, subtitle, color, icon, linkTo }) => {
  const card = (
    <div className="dash-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="dash-stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="dash-stat-body">
        <div className="dash-stat-value" style={{ color }}>{value}</div>
        <div className="dash-stat-title">{title}</div>
        {subtitle && <div className="dash-stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  if (linkTo) return <Link to={linkTo} style={{ textDecoration: 'none' }}>{card}</Link>;
  return card;
};

// ---- Donut-style Progress Ring for Follow-up statuses ----
const DonutChart = ({ segments }) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  if (total === 0) return <div className="dash-donut-empty">No data</div>;

  let cumulativePercent = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="dash-donut-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segments.map((seg, i) => {
          const segPercent = seg.value / total;
          const dashArray = `${segPercent * circumference} ${circumference}`;
          const rotation = cumulativePercent * 360 - 90;
          cumulativePercent += segPercent;
          return (
            <circle
              key={i}
              cx="80" cy="80" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={dashArray}
              strokeDashoffset={0}
              transform={`rotate(${rotation} 80 80)`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="bold" fill="var(--text-h)">{total}</text>
        <text x="80" y="96" textAnchor="middle" fontSize="11" fill="var(--text)">Follow-ups</text>
      </svg>
      <div className="dash-donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="dash-legend-item">
            <span className="dash-legend-dot" style={{ background: seg.color }} />
            <span className="dash-legend-label">{seg.label}</span>
            <span className="dash-legend-count">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Horizontal Bar for SE Breakdown ----
const SeBar = ({ name, count, total, color = '#6c63ff' }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="dash-se-bar-row">
      <div className="dash-se-bar-label">
        <span className="dash-se-name">{name || 'Unknown'}</span>
        <span className="dash-se-count">{count} customers</span>
      </div>
      <div className="dash-se-bar-track">
        <div className="dash-se-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="dash-se-pct">{pct}%</span>
    </div>
  );
};

// ---- Recent Interaction Row ----
const InteractionRow = ({ interaction }) => {
  const typeColors = { Call: '#3498db', Email: '#9b59b6', Meeting: '#e67e22' };
  const typeIcons = { Call: '📞', Email: '✉️', Meeting: '🤝' };

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
          <Link to={`/customers/${interaction.customer?._id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            {interaction.customer?.name || 'Unknown'}
          </Link>
          {' · '}by {interaction.createdBy?.name || 'Unknown'}
        </div>
      </div>
      <div className="dash-interaction-date">
        {new Date(interaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
};

// ---- Upcoming Follow-up Row ----
const FollowUpRow = ({ fu }) => {
  const now = new Date();
  const isOverdue = fu.isOverdue || (new Date(fu.date) < now);
  const statusColors = { 'Pending': '#f39c12', 'In Progress': '#3498db' };

  return (
    <Link to={`/follow-ups/${fu._id}/edit`} className="dash-followup-row" style={{ borderLeft: `3px solid ${isOverdue ? '#e74c3c' : statusColors[fu.status] || '#aaa'}` }}>
      <div className="dash-followup-info">
        <span className="dash-followup-customer">{fu.customer?.name || 'Unknown'}</span>
        {fu.createdBy && <span className="dash-followup-notes">by {fu.createdBy?.name}</span>}
      </div>
      <div className="dash-followup-meta">
        <span className="dash-followup-date" style={{ color: isOverdue ? '#e74c3c' : 'var(--text)' }}>
          {new Date(fu.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {isOverdue && <span className="dash-overdue-badge">OVERDUE</span>}
        </span>
        <span className="dash-status-pill" style={{ background: `${statusColors[fu.status]}20`, color: statusColors[fu.status] }}>
          {fu.status}
        </span>
      </div>
    </Link>
  );
};

// ---- Main Admin Dashboard ----
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load admin dashboard');
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
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) return <div className="dash-error">⚠️ {error}</div>;

  const { summary, upcomingFollowUps, recentInteractions, customersPerSe, followUpsPerSe } = data;
  const totalCustomers = summary.totalCustomers;

  const followUpSegments = [
    { label: 'Pending', value: summary.followUps.pending, color: '#f39c12' },
    { label: 'In Progress', value: summary.followUps.inProgress, color: '#3498db' },
    { label: 'Completed', value: summary.followUps.completed, color: '#2ecc71' },
    { label: 'Cancelled', value: summary.followUps.cancelled, color: '#e74c3c' }
  ];

  const interactionColors = ['#3498db', '#9b59b6', '#e67e22'];
  const interactionTypes = [
    { label: 'Calls', value: summary.interactions.byType.Call, color: '#3498db' },
    { label: 'Emails', value: summary.interactions.byType.Email, color: '#9b59b6' },
    { label: 'Meetings', value: summary.interactions.byType.Meeting, color: '#e67e22' }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Admin Dashboard</h1>
          <p className="dash-subtitle">System-wide CRM metrics and activity overview</p>
        </div>
        <div className="dash-quick-actions">
          <Link to="/admin/users/new" className="premium-btn premium-btn-primary">+ Add User</Link>
          <Link to="/customers/new" className="premium-btn premium-btn-secondary">+ Add Customer</Link>
        </div>
      </div>

      {/* Top Stats */}
      <div className="dash-stats-grid">
        <StatCard title="Total Customers" value={summary.totalCustomers} subtitle="Across all accounts" color="#6c63ff" icon="👥" linkTo="/customers" />
        <StatCard title="Sales Executives" value={summary.totalSalesExecutives} subtitle="Active team members" color="#3498db" icon="🧑‍💼" linkTo="/admin/users" />
        <StatCard title="Overdue Follow-ups" value={summary.followUps.overdue} subtitle={summary.followUps.overdue > 0 ? 'Needs attention' : 'All clear!'} color={summary.followUps.overdue > 0 ? '#e74c3c' : '#2ecc71'} icon={summary.followUps.overdue > 0 ? '🔴' : '✅'} linkTo="/follow-ups" />
        <StatCard title="Completed Follow-ups" value={summary.followUps.completed} subtitle="All time" color="#2ecc71" icon="✔️" linkTo="/follow-ups?status=Completed" />
        <StatCard title="Total Follow-ups" value={summary.followUps.total} subtitle="All statuses" color="#f39c12" icon="📋" linkTo="/follow-ups" />
        <StatCard title="Total Interactions" value={summary.interactions.total} subtitle="Calls, Emails, Meetings" color="#9b59b6" icon="💬" linkTo="/interactions" />
      </div>

      {/* Charts Row */}
      <div className="dash-charts-grid">
        {/* Follow-up Donut Chart */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">📊</span>
              Follow-up Status Breakdown
            </h3>
          </div>
          <div className="dash-panel-body dash-panel-center">
            <DonutChart segments={followUpSegments} />
          </div>
        </div>

        {/* Interaction Type Breakdown */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">💬</span>
              Interaction Breakdown
            </h3>
          </div>
          <div className="dash-panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
              {interactionTypes.map((type, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', color: type.color }}>{type.label}</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-h)' }}>{type.value}</span>
                  </div>
                  <div className="dash-se-bar-track">
                    <div
                      className="dash-se-bar-fill"
                      style={{
                        width: summary.interactions.total > 0 ? `${Math.round((type.value / summary.interactions.total) * 100)}%` : '0%',
                        background: type.color
                      }}
                    />
                  </div>
                </div>
              ))}
              {summary.interactions.total === 0 && (
                <p style={{ color: 'var(--text)', textAlign: 'center', padding: '20px 0' }}>No interactions yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Customers per SE */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">🧑‍💼</span>
              Customers per SE
            </h3>
            <Link to="/admin/users" className="dash-panel-link">Manage →</Link>
          </div>
          <div className="dash-panel-body">
            {customersPerSe.length === 0 ? (
              <div className="dash-empty">
                <span>👥</span>
                <p>No customers assigned yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {customersPerSe.map((se, i) => (
                  <SeBar key={i} name={se.name} count={se.count} total={totalCustomers} color={['#6c63ff', '#3498db', '#e67e22', '#2ecc71', '#e74c3c'][i % 5]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SE Follow-up Activity Table */}
      {followUpsPerSe.length > 0 && (
        <div className="dash-panel dash-panel-wide">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">📋</span>
              Follow-up Activity by SE
            </h3>
          </div>
          <div className="dash-panel-body">
            <div style={{ overflowX: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Sales Executive</th>
                    <th style={{ textAlign: 'center' }}>Pending</th>
                    <th style={{ textAlign: 'center' }}>In Progress</th>
                    <th style={{ textAlign: 'center' }}>Completed</th>
                    <th style={{ textAlign: 'center' }}>Cancelled</th>
                    <th style={{ textAlign: 'center' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {followUpsPerSe.map((se, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>{se.name || 'Unknown'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#f39c12', fontWeight: '600' }}>{se.pending}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#3498db', fontWeight: '600' }}>{se.inProgress}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#2ecc71', fontWeight: '600' }}>{se.completed}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#e74c3c', fontWeight: '600' }}>{se.cancelled}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-h)' }}>{se.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row: Upcoming Follow-ups + Recent Interactions */}
      <div className="dash-main-grid">
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
              <div className="dash-empty"><span>🎉</span><p>No upcoming follow-ups in 7 days.</p></div>
            ) : (
              upcomingFollowUps.map(fu => <FollowUpRow key={fu._id} fu={fu} />)
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">
              <span className="dash-panel-icon">💬</span>
              Recent Interactions
            </h3>
            <Link to="/interactions" className="dash-panel-link">View all →</Link>
          </div>
          <div className="dash-panel-body">
            {recentInteractions.length === 0 ? (
              <div className="dash-empty"><span>📋</span><p>No interactions logged yet.</p></div>
            ) : (
              recentInteractions.map(i => <InteractionRow key={i._id} interaction={i} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
