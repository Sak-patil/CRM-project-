import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Landing.css';

const Check = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 3.5 3.5L16 5" /></svg>;

const Landing = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <main className="landing-page">
      <div className="landing-grid" aria-hidden="true" />
      <header className="landing-nav">
        <Link to="/" className="landing-brand"><span>C</span>ClientFlow</Link>
        <div className="landing-nav-actions"><a href="#how-it-works">How it works</a><a href="#features">Capabilities</a><Link to="/login" className="landing-signin">Sign in</Link></div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="landing-eyebrow"><span /> CUSTOMER RELATIONSHIP MANAGEMENT</div>
          <h1>Make every customer<br />conversation count.</h1>
          <p className="hero-lede">ClientFlow gives sales teams one clear place to manage customers, schedule follow-ups, and turn each conversation into meaningful progress.</p>
          <div className="hero-actions"><Link to="/login" className="landing-primary">Sign in to ClientFlow <span>→</span></Link><a href="#how-it-works" className="landing-secondary">Explore the platform</a></div>
          <div className="hero-proof"><span><Check /> Customer records</span><span><Check /> Follow-up workflow</span><span><Check /> Team visibility</span></div>
        </div>
        <div className="hero-scene" aria-label="A three-dimensional representation of a connected customer workflow">
          <div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" />
          <div className="scene-shadow" />
          <div className="scene-cube">
            <div className="cube-face cube-front"><span className="face-kicker">CLIENTFLOW</span><strong>Customer<br />workspace</strong><i /></div>
            <div className="cube-face cube-top"><span>CRM</span><b /></div>
            <div className="cube-face cube-side"><em>01</em><small>Follow<br />through</small></div>
          </div>
          <div className="scene-tag tag-one"><span className="tag-dot" />Follow-up due</div>
          <div className="scene-tag tag-two"><span className="tag-avatar">A</span>Account updated</div>
          <div className="scene-tag tag-three">Interaction logged <b>✓</b></div>
        </div>
      </section>

      <section id="how-it-works" className="landing-intro">
        <p className="section-label">THE CLIENTFLOW APPROACH</p>
        <h2>Built around the work that moves relationships forward.</h2>
        <p>Keep the context, next step, and account owner visible without adding another complicated process to your team’s day.</p>
      </section>

      <section id="features" className="feature-grid">
        <article><span className="feature-number">01</span><h3>Understand every account</h3><p>Keep customer details, ownership, and contact history together in one dependable record.</p></article>
        <article><span className="feature-number">02</span><h3>Follow through on time</h3><p>Track planned outreach, see overdue work quickly, and keep momentum visible across the team.</p></article>
        <article><span className="feature-number">03</span><h3>See the work clearly</h3><p>Operational dashboards turn daily customer activity into a useful, actionable view for sales leaders.</p></article>
      </section>

      <section className="landing-cta"><div><p className="section-label">READY WHEN YOU ARE</p><h2>A more intentional way to manage customers.</h2></div><Link to="/login" className="landing-primary">Sign in <span>→</span></Link></section>
      <footer className="landing-footer"><span>© {new Date().getFullYear()} ClientFlow</span><span>Customer relationship management, made practical.</span></footer>
    </main>
  );
};

export default Landing;
