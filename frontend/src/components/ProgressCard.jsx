export default function ProgressCard({ value, label, sub, accent }) {
  return (
    <div className={`progress-card ${accent ? `progress-card--${accent}` : ""}`}>
      <p className="progress-card-value">{value}</p>
      <p className="progress-card-label">{label}</p>
      {sub && <p className="progress-card-sub">{sub}</p>}
    </div>
  );
}
