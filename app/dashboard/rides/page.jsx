"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { Icons } from "@/components/Icons";
import { useSession } from "@/components/useSession";
import { useSocket } from "@/components/useSocket";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function RidesPage() {
  const { data, isLoading } = useSession();
  const rides = useSWR(data ? "/api/rides" : null, fetcher);
  const drivers = useSWR(data?.user?.role === "passenger" ? "/api/drivers/available" : null, fetcher);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ pickup: "Main Gate", destination: "Lecture Hall Complex", scheduledFor: "", paymentMethod: "upi" });
  const [rating, setRating] = useState({ rideId: "", score: 5, feedback: "" });
  const [paymentModal, setPaymentModal] = useState(null);

  const handlers = useMemo(() => ({
    "ride:requested": () => {
      rides.mutate();
      setToast("New ride request received");
    },
    "ride:updated": () => {
      rides.mutate();
      setToast("Ride status updated live");
    },
    "driver:availability": () => drivers.mutate()
  }), [rides, drivers]);
  useSocket(data?.user, handlers);

  if (isLoading || !data) return <div className="page">Loading rides...</div>;
  const user = data.user;

  async function createRide(event) {
    event.preventDefault();
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduledFor: form.scheduledFor || undefined })
    });
    const payload = await res.json();
    if (res.ok) {
      if (form.paymentMethod !== "cash") {
        setPaymentModal({
          method: form.paymentMethod,
          amount: payload.ride.fare,
          ref: payload.ride.payment?.transactionRef || `TXN-${Date.now()}`
        });
      } else {
        setToast("Ride requested and broadcast to drivers");
      }
    } else {
      setToast(payload.error);
    }
    rides.mutate();
  }

  async function action(id, name) {
    const res = await fetch(`/api/rides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: name })
    });
    const payload = await res.json();
    setToast(res.ok ? `Ride ${name} updated` : payload.error);
    rides.mutate();
  }

  async function submitRating(event) {
    event.preventDefault();
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rating, score: Number(rating.score) })
    });
    const payload = await res.json();
    setToast(res.ok ? "Rating submitted" : payload.error);
    rides.mutate();
  }

  return (
    <DashboardShell user={user} title="Ride Management">
      <div className="grid two">
        {user.role === "passenger" ? (
          <div className="card">
            <div className="card-body">
              <h2>Request a ride</h2>
              <form className="form" onSubmit={createRide}>
                <label className="field"><span>Pickup</span><input value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} /></label>
                <label className="field"><span>Destination</span><input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></label>
                <label className="field"><span>Schedule for</span><input type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} /></label>
                <label className="field"><span>Payment</span><select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="qr">QR</option></select></label>
                <button className="btn primary"><Icons.Plus size={17} /> Request ride</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <h2>Driver queue</h2>
              <p className="muted">Requested rides appear here instantly. The server prevents double assignment.</p>
              <StatusBadge status={data.driverProfile?.availability || "offline"} />
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <h2>Available drivers</h2>
            {drivers.data?.drivers?.length ? drivers.data.drivers.map((driver) => (
              <p key={driver.id}><strong>{driver.user?.name}</strong> · {driver.vehicleNumber} · {driver.currentLocation} · {driver.averageRating || 0} stars</p>
            )) : <p className="muted">No available drivers listed yet.</p>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-body">
          <h2>Ride activity</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr><th>Route</th><th>Passenger</th><th>Driver</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rides.data?.rides?.map((ride) => (
                  <tr key={ride.id}>
                    <td><strong>{ride.pickup}</strong><br /><span className="muted">to {ride.destination}</span></td>
                    <td>{ride.passenger?.name || "-"}</td>
                    <td>{ride.driver?.user?.name || "Unassigned"}</td>
                    <td><StatusBadge status={ride.status} /></td>
                    <td>{ride.paymentMethod} · Rs {ride.fare}<br /><span className="muted">{ride.payment?.status}</span></td>
                    <td>
                      <div className="action-row">
                        {user.role === "driver" && ride.status === "requested" ? <button className="btn primary" onClick={() => action(ride.id, "accept")}>Accept</button> : null}
                        {user.role === "driver" && ride.status === "accepted" ? <button className="btn warning" onClick={() => action(ride.id, "start")}>Start</button> : null}
                        {user.role === "driver" && ride.status === "in_progress" ? <button className="btn primary" onClick={() => action(ride.id, "complete")}>Complete</button> : null}
                        {["requested", "accepted"].includes(ride.status) ? <button className="btn danger" onClick={() => action(ride.id, "cancel")}>Cancel</button> : null}
                        {user.role === "passenger" && ride.status === "completed" && !ride.rating ? <button className="btn" onClick={() => setRating({ ...rating, rideId: ride.id })}><Icons.Star size={16} /> Rate</button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {rating.rideId ? (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-body">
            <h2>Rate completed ride</h2>
            <form className="form" onSubmit={submitRating}>
              <label className="field"><span>Score</span><select value={rating.score} onChange={(e) => setRating({ ...rating, score: e.target.value })}><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>
              <label className="field"><span>Feedback</span><textarea value={rating.feedback} onChange={(e) => setRating({ ...rating, feedback: e.target.value })} /></label>
              <button className="btn primary">Submit feedback</button>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? <div className="toast" onClick={() => setToast("")}>{toast}</div> : null}

      {paymentModal ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 360, padding: "1.5rem" }}>
            <div className="card-body">
              <h2>{paymentModal.method === "upi" ? "UPI Payment" : "QR Code Payment"}</h2>
              {paymentModal.method === "qr" ? (
                <div style={{ textAlign: "center", margin: "1rem 0" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?am=${paymentModal.amount}&tn=CampusMobility&tr=${paymentModal.ref}`}
                    alt="QR Code"
                    style={{ borderRadius: 8, border: "1px solid var(--line)" }}
                  />
                  <p style={{ marginTop: 8 }} className="muted">Scan to pay ₹{paymentModal.amount}</p>
                </div>
              ) : (
                <div style={{ background: "var(--surface)", borderRadius: 8, padding: "1rem", margin: "1rem 0", textAlign: "center" }}>
                  <p style={{ fontSize: 13 }} className="muted">UPI ID</p>
                  <p style={{ fontWeight: 600, fontSize: 18 }}>campusmobility@upi</p>
                  <p style={{ fontSize: 22, fontWeight: 700, margin: "0.5rem 0" }}>₹{paymentModal.amount}</p>
                  <p style={{ fontSize: 12 }} className="muted">Ref: {paymentModal.ref}</p>
                </div>
              )}
              <p className="muted" style={{ fontSize: 13 }}>This is a simulated payment. Your ride has been booked.</p>
              <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={() => { setPaymentModal(null); setToast("Ride requested and broadcast to drivers"); }}>
                Payment Done ✓
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
