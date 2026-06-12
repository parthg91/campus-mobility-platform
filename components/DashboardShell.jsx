"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";

export default function DashboardShell({ user, children, title, action }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Icons.Navigation size={20} /></span>
          <span>Campus Mobility</span>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard"><Icons.LayoutDashboard size={18} /> Overview</Link>
          <Link href="/dashboard/rides"><Icons.CarFront size={18} /> Rides</Link>
          <Link href="/dashboard/analytics"><Icons.BarChart3 size={18} /> Analytics</Link>
          <Link href="/dashboard/profile"><Icons.UserRound size={18} /> Profile</Link>
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
