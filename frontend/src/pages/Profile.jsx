import { useState } from 'react';
import api, { getError } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/format';

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    college: user?.college || '', degree: user?.degree || '', graduationYear: user?.graduationYear || '',
    skills: (user?.skills || []).join(', '), bio: user?.bio || '',
    resumeUrl: user?.resumeUrl || '', linkedin: user?.linkedin || '', github: user?.github || '', portfolio: user?.portfolio || '',
    company: user?.company || '', designation: user?.designation || '', companyWebsite: user?.companyWebsite || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      await api.put('/auth/profile', {
        ...form,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      });
      await refreshMe();
      setMsg('Profile updated successfully.');
    } catch (error) {
      setErr(getError(error));
    } finally {
      setBusy(false);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      await api.put('/auth/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      setMsg('Password changed successfully.');
    } catch (error) {
      setErr(getError(error));
    } finally {
      setBusy(false);
    }
  };

  const upload = async (kind, file) => {
    if (!file) return;
    setUploading(kind);
    setErr('');
    try {
      const fd = new FormData();
      fd.append(kind === 'resume' ? 'resume' : 'avatar', file);
      const res = await api.post(`/uploads/${kind}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (kind === 'resume') setForm((f) => ({ ...f, resumeUrl: res.data.url }));
      await refreshMe();
      setMsg(kind === 'resume' ? 'Resume uploaded.' : 'Profile photo updated.');
    } catch (error) {
      setErr(getError(error));
    } finally {
      setUploading('');
    }
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="container section narrow">
      <h1 className="page-title">My profile</h1>
      <p className="muted">{user?.email} • {user?.role}</p>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <div className="card profile-top">
        <div className="company-logo lg">{user?.avatar ? <img src={user.avatar} alt="avatar" /> : initials(user?.name)}</div>
        <div>
          <h3>{user?.name}</h3>
          <label className="btn btn-ghost btn-sm">
            {uploading === 'avatar' ? 'Uploading...' : '📷 Change photo'}
            <input type="file" hidden accept="image/*" onChange={(e) => upload('avatar', e.target.files[0])} />
          </label>
        </div>
      </div>

      <form onSubmit={save} className="form card form-card">
        <h3>Basic info</h3>
        <div className="form-row">
          <label>Full name<input value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label>Phone<input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 ..." /></label>
        </div>

        {isStudent ? (
          <>
            <h3>Education</h3>
            <div className="form-row">
              <label>College<input value={form.college} onChange={(e) => set('college', e.target.value)} /></label>
              <label>Degree<input value={form.degree} onChange={(e) => set('degree', e.target.value)} placeholder="B.Tech, CSE" /></label>
            </div>
            <div className="form-row">
              <label>Graduation year<input type="number" value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} placeholder="2027" /></label>
              <label>Skills (comma separated)<input value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, Python, SQL" /></label>
            </div>
            <label>Bio<textarea rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A line or two about you..." /></label>
            <h3>Links & resume</h3>
            <label>Resume
              <div className="inline-upload">
                <input value={form.resumeUrl} onChange={(e) => set('resumeUrl', e.target.value)} placeholder="https://... or upload a PDF" />
                <label className="btn btn-ghost btn-sm">
                  {uploading === 'resume' ? '...' : 'Upload'}
                  <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => upload('resume', e.target.files[0])} />
                </label>
              </div>
            </label>
            <div className="form-row">
              <label>LinkedIn<input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} /></label>
              <label>GitHub<input value={form.github} onChange={(e) => set('github', e.target.value)} /></label>
            </div>
            <label>Portfolio<input value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} /></label>
          </>
        ) : (
          <>
            <h3>Company</h3>
            <div className="form-row">
              <label>Company<input value={form.company} onChange={(e) => set('company', e.target.value)} /></label>
              <label>Designation<input value={form.designation} onChange={(e) => set('designation', e.target.value)} /></label>
            </div>
            <label>Company website<input value={form.companyWebsite} onChange={(e) => set('companyWebsite', e.target.value)} /></label>
          </>
        )}
        <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
      </form>

      <form onSubmit={changePw} className="form card form-card">
        <h3>Change password</h3>
        <div className="form-row">
          <label>Current password<input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
          <label>New password<input type="password" required minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
        </div>
        <button className="btn btn-ghost" disabled={busy}>Update password</button>
      </form>
    </div>
  );
}
