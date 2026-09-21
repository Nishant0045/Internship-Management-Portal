import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getError } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import { formatDate, formatDateTime, stipend } from '../utils/format';

const NEXT = ['Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showInterview, setShowInterview] = useState(false);
  const [interview, setInterview] = useState({ date: '', link: '', location: '', notes: '' });
  const [review, setReview] = useState({ rating: '', reviewNotes: '' });
  const [busy, setBusy] = useState(false);

  const load = () => api.get(`/applications/${id}`).then((res) => {
    setApp(res.data);
    setReview({ rating: res.data.rating || '', reviewNotes: res.data.reviewNotes || '' });
  });

  useEffect(() => {
    load().catch(() => {}).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="container section"><Loader /></div>;
  if (!app) {
    return (
      <div className="container section">
        <h1>Application not found</h1>
        <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
      </div>
    );
  }

  const isStudent = user?.role === 'student';
  const isManager = user?.role !== 'student';

  const changeStatus = async (status) => {
    setBusy(true);
    setMsg('');
    try {
      const res = await api.patch(`/applications/${id}/status`, { status, note: msg || undefined });
      setApp(res.data);
      setMsg('');
    } catch (err) {
      alert(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const saveInterview = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.patch(`/applications/${id}/interview`, { ...interview, date: new Date(interview.date).toISOString() });
      setApp(res.data);
      setShowInterview(false);
    } catch (err) {
      alert(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const saveReview = async () => {
    setBusy(true);
    try {
      const res = await api.patch(`/applications/${id}/review`, {
        rating: review.rating ? Number(review.rating) : undefined,
        reviewNotes: review.reviewNotes,
      });
      setApp(res.data);
      alert('Review saved.');
    } catch (err) {
      alert(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      const res = await api.patch(`/applications/${id}/withdraw`);
      setApp(res.data);
    } catch (err) {
      alert(getError(err));
    }
  };

  const job = app.internship || {};
  const student = app.student || {};

  return (
    <div className="container section">
      <Link to={isStudent ? '/dashboard/student' : '/recruiter/applications'} className="link">← Back</Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">{job.title || 'Application'}</h1>
          <p className="muted">{job.company} • Applied {formatDate(app.createdAt)}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="dash-2col">
        <div>
          <div className="card">
            <h3>Candidate</h3>
            <p><b>{student.name}</b> • {student.email}</p>
            <p className="muted small">
              {[student.college, student.degree, student.graduationYear && `Class of ${student.graduationYear}`].filter(Boolean).join(' • ')}
            </p>
            {student.skills?.length > 0 && (
              <div className="chips">{student.skills.map((s) => <span key={s} className="chip chip-skill">{s}</span>)}</div>
            )}
            {student.bio && <p className="pre-wrap">{student.bio}</p>}
            <div className="link-row">
              {app.resumeUrl && <a className="btn btn-ghost btn-sm" href={app.resumeUrl} target="_blank" rel="noreferrer">📄 Resume</a>}
              {(app.linkedin || student.linkedin) && <a className="btn btn-ghost btn-sm" href={app.linkedin || student.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
              {(app.portfolio || student.portfolio) && <a className="btn btn-ghost btn-sm" href={app.portfolio || student.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
              {student.github && <a className="btn btn-ghost btn-sm" href={student.github} target="_blank" rel="noreferrer">GitHub</a>}
            </div>
          </div>

          <div className="card">
            <h3>Cover letter</h3>
            <p className="pre-wrap">{app.coverLetter}</p>
            {app.phone && <p className="muted small">📞 {app.phone}</p>}
          </div>

          {app.interview?.date && (
            <div className="card highlight">
              <h3>📅 Interview scheduled</h3>
              <p><b>{formatDateTime(app.interview.date)}</b></p>
              {app.interview.link && <p><a className="link" href={app.interview.link} target="_blank" rel="noreferrer">{app.interview.link}</a></p>}
              {app.interview.location && <p className="muted">📍 {app.interview.location}</p>}
              {app.interview.notes && <p className="muted">{app.interview.notes}</p>}
            </div>
          )}

          <div className="card">
            <h3>Status timeline</h3>
            <div className="timeline">
              {(app.timeline || []).map((t, i) => (
                <div key={i} className="timeline-item">
                  <span className="timeline-dot" />
                  <div>
                    <b>{t.status}</b>
                    <div className="muted small">{t.note} • {formatDateTime(t.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Role snapshot</h3>
            <p><Link to={`/internships/${job._id}`} className="link"><b>{job.title}</b></Link></p>
            <p className="muted small">{job.company} • {job.location} • {job.mode}</p>
            <p><b>{stipend(job.stipendMin, job.stipendMax)}</b></p>
          </div>

          {isStudent && !['Selected', 'Rejected', 'Withdrawn'].includes(app.status) && (
            <div className="card">
              <h3>Manage</h3>
              <button className="btn btn-danger btn-block" onClick={withdraw}>Withdraw application</button>
            </div>
          )}

          {isManager && (
            <>
              <div className="card">
                <h3>Update status</h3>
                <label>Note (optional)<input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="e.g. Great portfolio, moving ahead" /></label>
                <div className="btn-grid">
                  {NEXT.map((s) => (
                    <button key={s} className="btn btn-ghost btn-sm" disabled={busy || app.status === s} onClick={() => changeStatus(s)}>
                      {s}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={() => setShowInterview(true)}>
                  📅 Schedule interview
                </button>
              </div>
              <div className="card">
                <h3>Internal review</h3>
                <label>Rating (0–5)<input type="number" min={0} max={5} step={0.5} value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })} /></label>
                <label>Private notes<textarea rows={3} value={review.reviewNotes} onChange={(e) => setReview({ ...review, reviewNotes: e.target.value })} placeholder="Only visible to your hiring team..." /></label>
                <button className="btn btn-ghost btn-block" disabled={busy} onClick={saveReview}>Save review</button>
              </div>
            </>
          )}
        </div>
      </div>

      {showInterview && (
        <Modal title="Schedule interview" onClose={() => setShowInterview(false)}>
          <form onSubmit={saveInterview} className="form">
            <label>Date & time *<input type="datetime-local" required value={interview.date} onChange={(e) => setInterview({ ...interview, date: e.target.value })} /></label>
            <label>Meeting link<input value={interview.link} onChange={(e) => setInterview({ ...interview, link: e.target.value })} placeholder="https://meet.google.com/..." /></label>
            <label>Location<input value={interview.location} onChange={(e) => setInterview({ ...interview, location: e.target.value })} placeholder="Office address (if in-person)" /></label>
            <label>Notes<textarea rows={3} value={interview.notes} onChange={(e) => setInterview({ ...interview, notes: e.target.value })} placeholder="Round details, interviewer, prep..." /></label>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Scheduling...' : 'Schedule & notify candidate'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
