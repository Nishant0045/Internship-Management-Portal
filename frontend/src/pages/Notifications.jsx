import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { timeAgo } from '../utils/format';

const ICONS = {
  application_status: '📝',
  new_application: '👥',
  interview: '📅',
  new_internship: '📢',
  system: '🔔',
};

export default function Notifications() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications?limit=30').then((res) => setNotes(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotes((list) => list.map((n) => ({ ...n, isRead: true })));
  };

  const openNote = async (n) => {
    if (!n.isRead) {
      await api.patch(`/notifications/${n._id}/read`);
      setNotes((list) => list.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    }
  };

  if (loading) return <div className="container section"><Loader /></div>;

  return (
    <div className="container section narrow">
      <div className="page-head">
        <h1 className="page-title">Notifications 🔔</h1>
        {notes.some((n) => !n.isRead) && <button className="btn btn-ghost btn-sm" onClick={markAll}>Mark all read</button>}
      </div>
      {notes.length === 0 ? (
        <EmptyState title="You're all caught up" text="Status updates, interviews and new applications will appear here." />
      ) : (
        <div className="notes">
          {notes.map((n) => (
            <Link key={n._id} to={n.link || '/notifications'} onClick={() => openNote(n)} className={`card note ${n.isRead ? '' : 'unread'}`}>
              <span className="note-icon">{ICONS[n.type] || '🔔'}</span>
              <span>
                <b>{n.title}</b>
                <p className="muted">{n.message}</p>
                <small className="muted">{timeAgo(n.createdAt)}</small>
              </span>
              {!n.isRead && <span className="unread-dot" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
