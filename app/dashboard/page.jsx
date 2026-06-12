"use client";

import { useMemo } from "react";
import useSWR from "swr";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Icons } from "@/components/Icons";
import { useSession } from "@/components/useSession";
import { useSocket } from "@/components/useSocket";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, isLoading, mutate } = useSession();
  const rides = useSWR(data ? "/api/rides" : null, fetcher);
  const analytics = useSWR(data ? "/api/analytics/demand" : null, fetcher);
  const handlers = useMemo(() => ({
    "ride:updated": () => { rides.mutate(); analytics.mutate(); },
    "ride:requested": () => { rides.mutate(); analytics.mutate(); },
    "rating:created": () => analytics.mutate()
  }), [rides.mutate, analytics.mutate]);
  useSocket(data?.user, handlers);

  if (isLoading || !data) return <div className="page">Loading dashboard...</div>;

  const user = data.user;
  const stats = analytics.data?.stats || {};
  const activeRide = rides.data?.rides?.find((ride) => {
    if (user.role === "driver") {
      return ["accepted", "in_progress"].includes(ride.status) && ride.driverId === data.driverProfile?.id;
    }
    return ["requested", "accepted", "in_progress"].includes(ride.status);
  });

  async function setAvailability(availability) {
    await fetch("/api/drivers/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability, currentLocation: "Main Building" })
    });
    mutate();
  }

  return (
    <DashboardShell
      user={user}
      title={user.role === "driver" ? "Driver Dashboard" : "Passenger Dashboard"}
      action={user.role === "driver" ? (
        <div className="action-row">
          <button className="btn primary" onClick={() => setAvailability("online")}><Icons.Check size={17} /> Online</button>
          <button className="btn" onClick={() => setAvailability("offline")}>Offline</button>
        </div>
      ) : null}
    >
      <div className="grid three">
        <StatCard 
          label={user.role === "driver" ? "My completed rides" : "Total rides"} 
          value={user.role === "driver" ? (data.driverProfile?.totalRides ?? 0) : (stats.totalRides ?? 0)} 
          icon={Icons.CarFront} 
        />
        <StatCard 
          label="Active rides" 
          value={stats.activeRides ?? 0} 
          icon={Icons.Activity} 
          tone="var(--blue)" 
        />
        <StatCard 
          label={user.role === "driver" ? "My average rating" : "Online drivers"} 
          value={user.role === "driver" ? (data.driverProfile?.averageRating ?? 0) : (stats.onlineDrivers ?? 0)} 
          icon={user.role === "driver" ? Icons.Star : Icons.UserRound} 
          tone="var(--accent)" 
        />
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-body">
            <h2>Current workflow</h2>
            {activeRide ? (
              <>
                <p><strong>{activeRide.pickup}</strong> to <strong>{activeRide.destination}</strong></p>
                <StatusBadge status={activeRide.status} />
              </>
            ) : (
              <p className="muted">No active ride right now.</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h2>{user.role === "driver" ? "Driver profile" : "Quick actions"}</h2>
            {user.role === "driver" ? (
              <p className="muted">Availability: <StatusBadge status={data.driverProfile?.availability || "offline"} /> Vehicle: {data.driverProfile?.vehicleNumber}</p>
            ) : (
              <div className="action-row">
                <a className="btn primary" href="/dashboard/rides"><Icons.Plus size={17} /> Request ride</a>
                <a className="btn" href="/dashboard/analytics"><Icons.BarChart3 size={17} /> View demand</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
