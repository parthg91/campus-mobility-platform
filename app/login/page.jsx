"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "@/components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "passenger@campus.test", password: "password123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Login failed");
    router.push("/dashboard");
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <aside className="auth-side">
          <div className="brand"><span className="brand-mark"><Icons.Navigation size={20} /></span> Campus Mobility</div>
          <h1>Welcome back</h1>
          <p>Demo accounts are prefilled. Driver login: driver@campus.test / password123.</p>
        </aside>
        <main className="card-body">
          <h2>Login</h2>
          <form className="form" onSubmit={submit}>
            <label className="field"><span>Email</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="field"><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            {error ? <div className="badge red">{error}</div> : null}
            <button className="btn primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
            <Link className="muted" href="/register">Need an account? Register</Link>
          </form>
        </main>
      </div>
    </div>
  );
}
