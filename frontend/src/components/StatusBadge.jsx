export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status.toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>;
}
