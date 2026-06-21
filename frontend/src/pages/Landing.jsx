import { Link } from 'react-router-dom';
import './Landing.css';

const STAGES = ['Applied', 'Interviewing', 'Offer'];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-logo">
          <span className="landing-logo-mark">→</span>
          Pipeline
        </div>
        <nav className="landing-nav-links">
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/register" className="nav-cta">Get started</Link>
        </nav>
      </header>

      <main className="landing-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">For job seekers who apply in bulk</p>
          <h1 className="hero-title">
            Every application,<br />
            one clear pipeline.
          </h1>
          <p className="hero-sub">
            Stop losing track in spreadsheets and email threads. Log each
            role the moment you apply, watch it move toward an offer,
            and know exactly where you stand at a glance.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Start tracking — it's free</Link>
            <Link to="/login" className="btn-ghost">I already have an account</Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <PipelineDemo />
        </div>
      </main>

      <section className="landing-features">
        <div className="feature">
          <span className="feature-index">01</span>
          <h3>Log it in seconds</h3>
          <p>Company, role, link, notes. Four fields, no friction — built for the volume of a real job search.</p>
        </div>
        <div className="feature">
          <span className="feature-index">02</span>
          <h3>Watch status move</h3>
          <p>Applied, interviewing, offer, or rejected. One click changes everything — your board updates instantly.</p>
        </div>
        <div className="feature">
          <span className="feature-index">03</span>
          <h3>Know your timeline</h3>
          <p>See how long each application has been sitting, so you know exactly when to follow up.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Pipeline</span>
        <span className="footer-dim">Built for the search, not the spreadsheet.</span>
      </footer>
    </div>
  );
}

function PipelineDemo() {
  return (
    <div className="pipeline-demo">
      {STAGES.map((stage, i) => (
        <div className="pipeline-col" key={stage}>
          <div className="pipeline-col-label">{stage}</div>
          <div className="pipeline-col-track">
            {i === 0 && <div className="demo-card demo-card-1">Acme Corp<span>Product Designer</span></div>}
            {i === 1 && <div className="demo-card demo-card-2">Northwind<span>Frontend Eng</span></div>}
            {i === 2 && <div className="demo-card demo-card-3">Lumen Labs<span>Data Analyst</span></div>}
          </div>
        </div>
      ))}
    </div>
  );
}
