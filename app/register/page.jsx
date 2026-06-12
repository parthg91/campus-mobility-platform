"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";

const initial = {
  name: "",
  email: "",
  password: "",
  role: "passenger",
  phone: "",
  department: "",
  year: "",
  vehicleNumber: "",
  vehicleType: "E-Rickshaw",
  licenseNumber: "",
  verificationId: ""
};

export default function RegisterPage() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Registration failed");
    window.location.assign("/dashboard");
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <aside className="auth-side">
          <div className="brand"><span className="brand-mark"><Icons.Navigation size={20} /></span> Campus Mobility</div>
          <h1>Create account</h1>
          <p>Passengers can request rides. Drivers add vehicle and verification details before going online.</p>
        </aside>
        <main className="card-body">
          <h2>Registration</h2>
          <form className="form" onSubmit={submit}>
            <div className="grid two">
              <label className="field"><span>Name</span><input required value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
              <label className="field"><span>Email</span><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></label>
              <label className="field"><span>Password</span><input required type="password" minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} /></label>
              <label className="field"><span>Phone</span><input required value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label>
              <label className="field"><span>Role</span><select value={form.role} onChange={(e) => update("role", e.target.value)}><option value="passenger">Passenger</option><option value="driver">Driver</option></select></label>
              <label className="field"><span>Department</span><input value={form.department} onChange={(e) => update("department", e.target.value)} /></label>
              <label className="field"><span>Year</span><input placeholder="e.g. 2nd Year" value={form.year} onChange={(e) => update("year", e.target.value)} /></label>
            </div>
            {form.role === "driver" ? (
              <div className="grid two">
                <label className="field"><span>Vehicle number</span><input required value={form.vehicleNumber} onChange={(e) => update("vehicleNumber", e.target.value)} /></label>
                <label className="field"><span>Vehicle type</span><input value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)} /></label>
                <label className="field"><span>License number</span><input required value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} /></label>
                <label className="field"><span>Verification ID</span><input value={form.verificationId} onChange={(e) => update("verificationId", e.target.value)} /></label>
              </div>
            ) : null}
            {error ? <div className="badge red">{error}</div> : null}
            <button className="btn primary" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
            <a className="muted" href="/login">Already registered? Login</a>
          </form>
        </main>
      </div>
    </div>
  );
}
