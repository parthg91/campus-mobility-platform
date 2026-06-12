import Link from "next/link";
import { Icons } from "@/components/Icons";

export default function HomePage() {
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark"><Icons.Navigation size={20} /></span>
          <span>Campus Mobility</span>
        </Link>
        <nav className="nav">
          <Link className="btn" href="/login">Login</Link>
          <Link className="btn primary" href="/register">Register</Link>
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
            <Link className="btn primary" href="/register"><Icons.Plus size={18} /> Create account</Link>
            <Link className="btn" href="/login"><Icons.ShieldCheck size={18} /> Open dashboard</Link>
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
