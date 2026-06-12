"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useSession } from "@/components/useSession";

export default function ProfilePage() {
  const { data, isLoading, mutate } = useSession();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "",
    year: "",
    vehicleNumber: "",
    vehicleType: "E-Rickshaw",
    licenseNumber: "",
    verificationId: "",
    currentLocation: ""
  });

  useEffect(() => {
    if (!data) return;
    const user = data.user;
    const driver = data.driverProfile || {};
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      department: user.department || "",
      year: user.year || "",
      vehicleNumber: driver.vehicleNumber || "",
      vehicleType: driver.vehicleType || "E-Rickshaw",
      licenseNumber: driver.licenseNumber || "",
      verificationId: driver.verificationId || "",
      currentLocation: driver.currentLocation || ""
    });
  }, [data]);

  if (isLoading || !data) return <div className="page">Loading profile...</div>;

  const user = data.user;

  async function submit(event) {
    event.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const payload = await res.json();
    setMessage(res.ok ? "Profile updated" : payload.error);
    mutate();
  }

  return (
    <DashboardShell user={user} title="Profile Management">
      <div className="card">
        <div className="card-body">
          <form className="form" onSubmit={submit}>
            <div className="grid two">
              <label className="field"><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label className="field"><span>Department</span><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></label>
              <label className="field"><span>Year</span><input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label>
            </div>
            {user.role === "driver" ? (
              <div className="grid two">
                <label className="field"><span>Vehicle number</span><input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} /></label>
                <label className="field"><span>Vehicle type</span><input value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} /></label>
                <label className="field"><span>License number</span><input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></label>
                <label className="field"><span>Current location</span><input value={form.currentLocation} onChange={(e) => setForm({ ...form, currentLocation: e.target.value })} /></label>
              </div>
            ) : null}
            {message ? <span className="badge green">{message}</span> : null}
            <button className="btn primary">Save profile</button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
