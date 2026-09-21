export default function EmptyState({ icon = '📭', title = 'Nothing here yet', text = '', action = null }) {
  return (
    <div className="empty card">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}
