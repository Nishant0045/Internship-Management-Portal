import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getError } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = [
  'Software Engineering', 'Web Development', 'Mobile Development', 'AI & Data Science',
  'Data Analyst', 'UI/UX Design', 'Cyber Security', 'Digital Marketing',
  'Content Writing', 'Human Resources', 'Finance', 'Operations',
];

const empty = {
  title: '', company: '', companyWebsite: '', location: 'Remote', mode: 'Remote',
  jobType: 'Full-time', category: '', skills: '', stipendMin: '', stipendMax: '',
  duration: '3 months', openings: 1, description: '', responsibilities: '',
  requirements: '', perks: '', deadline: '', status: 'open',
};

const toLines = (v) => v.split('\n').map((s) => s.trim()).filter(Boolean);

export default function PostInternship() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.company && !isEdit) setForm((f) => ({ ...f, company: user.company }));
  }, [user, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/internships/${id}`)
      .then((res) => {
        const j = res.data;
        setForm({
          ...empty,
          ...j,
          skills: (j.skills || []).join(', '),
          responsibilities: (j.responsibilities || []).join('\n'),
          requirements: (j.requirements || []).join('\n'),
          perks: (j.perks || []).join('\n'),
          deadline: j.deadline ? j.deadline.slice(0, 10) : '',
        });
      })
      .catch(() => setError('Failed to load listing.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      ...form,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      responsibilities: toLines(form.responsibilities),
      requirements: toLines(form.requirements),
      perks: toLines(form.perks),
      stipendMin: Number(form.stipendMin) || 0,
      stipendMax: Number(form.stipendMax) || 0,
      openings: Number(form.openings) || 1,
      deadline: form.deadline || undefined,
    };
    try {
      if (isEdit) {
        await api.put(`/internships/${id}`, payload);
      } else {
        await api.post('/internships', payload);
      }
      navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/recruiter');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this listing and all its applications? This cannot be undone.')) return;
    try {
      await api.delete(`/internships/${id}`);
      navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/recruiter');
    } catch (err) {
      alert(getError(err));
    }
  };

  if (loading) return <div className="container section"><Loader /></div>;

  return (
    <div className="container section narrow">
      <h1 className="page-title">{isEdit ? 'Edit internship' : 'Post a new internship'}</h1>
      <p className="muted">Great listings get 3x more quality applicants. Be specific!</p>
      <form onSubmit={submit} className="form card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-row">
          <label>Job title *<input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Frontend Developer Intern" /></label>
          <label>Company *<input required value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="e.g. TechNova" /></label>
        </div>
        <div className="form-row">
          <label>Category *<select required value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select></label>
          <label>Company website<input value={form.companyWebsite} onChange={(e) => set('companyWebsite', e.target.value)} placeholder="https://..." /></label>
        </div>
        <div className="form-row3">
          <label>Location<input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote / Bengaluru" /></label>
          <label>Mode<select value={form.mode} onChange={(e) => set('mode', e.target.value)}>
            <option>Remote</option><option>On-site</option><option>Hybrid</option>
          </select></label>
          <label>Type<select value={form.jobType} onChange={(e) => set('jobType', e.target.value)}>
            <option>Full-time</option><option>Part-time</option>
          </select></label>
        </div>
        <label>Skills (comma separated)<input value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, JavaScript, CSS" /></label>
        <div className="form-row3">
          <label>Stipend min (₹/mo)<input type="number" min={0} value={form.stipendMin} onChange={(e) => set('stipendMin', e.target.value)} placeholder="30000" /></label>
          <label>Stipend max (₹/mo)<input type="number" min={0} value={form.stipendMax} onChange={(e) => set('stipendMax', e.target.value)} placeholder="45000" /></label>
          <label>Duration<input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="3 months" /></label>
        </div>
        <div className="form-row3">
          <label>Openings<input type="number" min={1} value={form.openings} onChange={(e) => set('openings', e.target.value)} /></label>
          <label>Deadline<input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} /></label>
          <label>Status<select value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="open">Open</option><option value="draft">Draft</option><option value="closed">Closed</option>
          </select></label>
        </div>
        <label>Description *<textarea required rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What is this internship about? Team, mission, what the intern will learn..." /></label>
        <label>Responsibilities (one per line)<textarea rows={3} value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} placeholder="Build React components&#10;Write unit tests" /></label>
        <label>Requirements (one per line)<textarea rows={3} value={form.requirements} onChange={(e) => set('requirements', e.target.value)} placeholder="Strong JavaScript fundamentals&#10;Available full-time" /></label>
        <label>Perks (one per line)<textarea rows={2} value={form.perks} onChange={(e) => set('perks', e.target.value)} placeholder="PPO opportunity&#10;Flexible hours" /></label>
        <div className="form-actions">
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Saving...' : isEdit ? 'Save changes' : 'Publish internship'}</button>
          {isEdit && <button type="button" className="btn btn-danger" onClick={remove}>Delete</button>}
        </div>
      </form>
    </div>
  );
}
