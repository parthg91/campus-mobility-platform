export default function StatusBadge({ status }) {
  const tone = {
    scheduled: "yellow",
    requested: "yellow",
    accepted: "blue",
    in_progress: "blue",
    completed: "green",
    cancelled: "red",
    rejected: "red",
    online: "green",
    offline: "",
    busy: "yellow"
  }[status] || "";

  return <span className={`badge ${tone}`}>{String(status || "").replaceAll("_", " ")}</span>;
}
