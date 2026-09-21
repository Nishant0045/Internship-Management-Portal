import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getError } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import { stipend, formatDate, timeAgo } from '../utils/format';

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ coverLetter: '', phone: '', resumeUrl: '', linkedin: '', portfolio: '' });
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/internships/${id}`)
      .then((res) => {
        setJob(res.data);
        if (user) {
          setForm((f) => ({
            ...f,
            phone: user.phone || '',
            resumeUrl: user.resumeUrl || '',
            linkedin: user.linkedin || '',
            portfolio: user.portfolio || '',
          }));
        }
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/internships/${id}` } });
    setApplying(true);
    setError('');
    try {
      await api.post('/applications', { internshipId: id, ...form });
      setShowApply(false);
      const res = await api.get(`/internships/${id}`);
      setJob(res.data);
      alert('Application submitted successfully!');
    } catch (err) {
      setError(getError(err));
    } finally {
      setApplying(false);
    }
  };

  const toggleSave = async () => {
    if (!user) return navigate('/login', { state: { from: `/internships/${id}` } });
    setSaving(true);
    try {
      const res = await api.post(`/users/me/saved/${id}`);
      setJob((j) => ({ ...j, isSaved: res.data.saved }));
    } catch (err) {
      alert(getError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container section"><Loader /></div>;
  if (!job) {
    return (
      <div className="container section">
        <h1>Internship not found</h1>
        <p className="muted">This listing may have been removed.</p>
        <Link to="/browse" className="btn btn-primary">Back to browse</Link>
      </div>
    );
  }

  const isStudent = !user || user.role === 'student';
  const canApply = isStudent && job.status === 'open' && !job.hasApplied;

  return (
    <div className="container section">
      <Link to="/browse" className="link">← Back to all internships</Link>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="card detail-head">
            <div className="company-logo lg">{(job.company || '?')[0]}</div>
            <div>
              <h1>{job.title}</h1>
              <p className="muted">{job.company} • {job.location} • {job.mode} • {job.jobType}</p>
              <div className="chips">
                <span className="chip">{job.category}</span>
                {(job.skills || []).map((s) => (
                  <span key={s} className="chip chip-skill">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3>About this internship</h3>
            <p className="pre-wrap">{job.description}</p>
          </div>

          {job.responsibilities?.length > 0 && (
            <div className="card">
              <h3>What you'll do</h3>
              <ul className="list">{job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          {job.requirements?.length > 0 && (
            <div className="card">
              <h3>What we're looking for</h3>
              <ul className="list">{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          {job.perks?.length > 0 && (
            <div className="card">
              <h3>Perks & benefits</h3>
              <ul className="list">{job.perks.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
        </div>

        <aside className="detail-side">
          <div className="card apply-box">
            <div className="stipend-lg">{stipend(job.stipendMin, job.stipendMax)}</div>
            <div className="apply-meta">
              <div><span>Duration</span><b>{job.duration}</b></div>
              <div><span>Openings</span><b>{job.openings}</b></div>
              <div><span>Deadline</span><b>{job.deadline ? formatDate(job.deadline) : 'Rolling'}</b></div>
              <div><span>Posted</span><b>{timeAgo(job.createdAt)}</b></div>
              <div><span>Applicants</span><b>{job.applicationsCount || 0}</b></div>
            </div>
            {job.hasApplied ? (
              <Link to={`/applications/${job.myApplication?._id}`} className="btn btn-success btn-block">
                ✓ Applied — Track status
              </Link>
            ) : canApply ? (
              <button className="btn btn-primary btn-block btn-lg" onClick={() => setShowApply(true)}>Apply Now</button>
            ) : job.status !== 'open' ? (
              <button className="btn btn-block" disabled>Applications closed</button>
            ) : (
              <button className="btn btn-block" disabled>Students can apply</button>
            )}
            {isStudent && (
              <button className="btn btn-ghost btn-block" disabled={saving} onClick={toggleSave}>
                {job.isSaved ? '★ Saved' : '☆ Save for later'}
              </button>
            )}
            {user?.role === 'recruiter' && (
              <Link to="/recruiter/applications" className="btn btn-ghost btn-block">Manage applicants</Link>
            )}
          </div>
          <div className="card">
            <h4>About {job.company}</h4>
            <p className="muted small">
              {job.postedBy?.name ? `Posted by ${job.postedBy.name}` : 'Verified recruiter'}
              {job.companyWebsite && (
                <>
                  {' • '}
                  <a href={job.companyWebsite} target="_blank" rel="noreferrer" className="link">Website</a>
                </>
              )}
            </p>
          </div>
        </aside>
      </div>

      {showApply && (
        <Modal title={`Apply — ${job.title}`} onClose={() => setShowApply(false)} wide>
          <form onSubmit={handleApply} className="form">
            {error && <div className="alert alert-error">{error}</div>}
            <label>
              Cover letter *
              <textarea
                rows={5}
                required
                value={form.coverLetter}
                onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                placeholder="Why are you a great fit? Mention relevant projects, skills, availability..."
              />
            </label>
            <div className="form-row">
              <label>
                Phone
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." />
              </label>
              <label>
                Resume URL
                <input value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} placeholder="https://... or upload in Profile" />
              </label>
            </div>
            <div className="form-row">
              <label>
                LinkedIn
                <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
              </label>
              <label>
                Portfolio / GitHub
                <input value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} placeholder="https://..." />
              </label>
            </div>
            <button className="btn btn-primary btn-lg" disabled={applying}>
              {applying ? 'Submitting...' : 'Submit application'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
