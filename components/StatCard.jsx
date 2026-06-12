export default function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="card">
      <div className="card-body stat">
        <div>
          <span className="muted">{label}</span>
          <strong>{value}</strong>
        </div>
        {Icon ? <Icon size={30} color={tone || "var(--brand)"} /> : null}
      </div>
    </div>
  );
}
