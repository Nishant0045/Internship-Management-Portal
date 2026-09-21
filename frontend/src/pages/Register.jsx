import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';
import { getError } from '../api/client';

export default function Register() {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', company: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await register({ ...form, role });
      navigate(dashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container section auth-wrap">
      <div className="card auth-card">
        <h1>Create your account 🚀</h1>
        <p className="muted">Join as a student or a recruiter.</p>
        <div className="role-toggle">
          <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>
            🎓 I'm a Student
          </button>
          <button type="button" className={role === 'recruiter' ? 'active' : ''} onClick={() => setRole('recruiter')}>
            💼 I'm Hiring
          </button>
        </div>
        <form onSubmit={submit} className="form">
          {error && <div className="alert alert-error">{error}</div>}
          <label>
            Full name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
          </label>
          {role === 'student' ? (
            <label>
              College / University
              <input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="e.g. IIT Guwahati" />
            </label>
          ) : (
            <label>
              Company
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. TechNova" />
            </label>
          )}
          <button className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? 'Creating account...' : `Sign up as ${role}`}
          </button>
        </form>
        <p className="muted center">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}
