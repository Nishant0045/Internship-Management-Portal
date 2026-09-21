export default function StatCard({ icon, label, value, accent = '' }) {
  return (
    <div className={`card stat ${accent}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="muted small">{label}</div>
      </div>
    </div>
  );
}
