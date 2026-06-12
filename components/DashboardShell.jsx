"use client";

import { Icons } from "@/components/Icons";

export default function DashboardShell({ user, children, title, action }) {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Icons.Navigation size={20} /></span>
          <span>Campus Mobility</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard"><Icons.LayoutDashboard size={18} /> Overview</a>
          <a href="/dashboard/rides"><Icons.CarFront size={18} /> Rides</a>
          <a href="/dashboard/analytics"><Icons.BarChart3 size={18} /> Analytics</a>
          <a href="/dashboard/profile"><Icons.UserRound size={18} /> Profile</a>
          <button onClick={logout}><Icons.LogOut size={18} /> Logout</button>
        </nav>
      </aside>
      <main className="main">
        <header className="main-head">
          <div>
            <h1>{title}</h1>
            <div className="muted">{user?.name} · {user?.role}</div>
          </div>
          {action}
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
