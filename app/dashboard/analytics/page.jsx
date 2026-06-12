"use client";

import { useMemo } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import { Icons } from "@/components/Icons";
import { useSession } from "@/components/useSession";
import { useSocket } from "@/components/useSocket";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const fetcher = (url) => fetch(url).then((res) => res.json());
const CampusMap = dynamic(() => import("@/components/CampusMap"), { ssr: false });

export default function AnalyticsPage() {
  const { data, isLoading } = useSession();
  const analytics = useSWR(data ? "/api/analytics/demand" : null, fetcher, { refreshInterval: 5000 });
  const driversData = useSWR(data ? "/api/drivers/available" : null, fetcher, { refreshInterval: 5000 });

  const handlers = useMemo(() => ({
    "ride:updated": () => { analytics.mutate(); driversData.mutate(); },
    "ride:requested": () => analytics.mutate(),
    "driver:availability": () => driversData.mutate()
  }), [analytics.mutate, driversData.mutate]);
  useSocket(data?.user, handlers);

  if (isLoading || !data) return <div className="page">Loading analytics...</div>;

  const stats = analytics.data?.stats || {};
  const hours = analytics.data?.byHour || [];
  const pickups = analytics.data?.popularPickups || [];
  const forecast = analytics.data?.forecast || [];
  const liveDrivers = driversData.data?.drivers || [];

  return (
    <DashboardShell user={data.user} title="Demand Analytics">
      <div className="grid three">
        <StatCard label="Completed rides" value={stats.completedRides ?? 0} icon={Icons.Check} />
        <StatCard label="Average rating" value={stats.averageRating ?? 0} icon={Icons.Star} tone="var(--accent)" />
        <StatCard label="Active demand" value={stats.activeRides ?? 0} icon={Icons.Activity} tone="var(--blue)" />
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-body">
            <h2>Peak demand hours</h2>
            <Line data={{
              labels: hours.map((item) => `${item.hour}:00`),
              datasets: [{ label: "Rides", data: hours.map((item) => item.rides), borderColor: "#146c5f", backgroundColor: "#146c5f" }]
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h2>Popular pickup locations</h2>
            <Bar data={{
              labels: pickups.map((item) => item.location),
              datasets: [{ label: "Requests", data: pickups.map((item) => item.count), backgroundColor: "#e7b84f" }]
            }} />
          </div>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-body">
            <h2>Demand forecast</h2>
            {forecast.length ? forecast.map((item) => <p key={item.label}><strong>{item.label}</strong> expected demand index {item.demand}</p>) : <p className="muted">Forecast appears after ride history is collected.</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h2>Live campus map</h2>
            <CampusMap drivers={liveDrivers} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
