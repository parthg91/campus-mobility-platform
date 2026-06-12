import { Icons } from "@/components/Icons";

export default function HomePage() {
  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark"><Icons.Navigation size={20} /></span>
          <span>Campus Mobility</span>
        </a>
        <nav className="nav">
          <a className="btn" href="/login">Login</a>
          <a className="btn primary" href="/register">Register</a>
        </nav>
      </header>
      <section className="hero">
        <div>
          <h1>Real-time campus rides for passengers and drivers.</h1>
          <p>
            A full-stack ride dispatch platform for campus e-rickshaws with secure accounts,
            live driver availability, request assignment, lifecycle tracking, ratings, and analytics.
          </p>
          <div className="action-row">
            <a className="btn primary" href="/register"><Icons.Plus size={18} /> Create account</a>
            <a className="btn" href="/login"><Icons.ShieldCheck size={18} /> Open dashboard</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Campus ride map preview">
          <div className="route-map">
            <div className="route-line" />
            <div className="pin one">Main Gate</div>
            <div className="pin two">Lecture Hall</div>
            <div className="pin three">4 drivers online</div>
          </div>
        </div>
      </section>
    </div>
  );
}
