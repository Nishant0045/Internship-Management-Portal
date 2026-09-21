import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';
import { getError } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      navigate(location.state?.from || dashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const quickFill = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="container section auth-wrap">
      <div className="card auth-card">
        <h1>Welcome back 👋</h1>
        <p className="muted">Log in to continue to InternHub.</p>
        <form onSubmit={submit} className="form">
          {error && <div className="alert alert-error">{error}</div>}
          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="muted center">
          New here? <Link to="/register" className="link">Create an account</Link>
        </p>
        <div className="demo-box">
          <small className="muted">Demo accounts (seeded in demo mode):</small>
          <div className="demo-btns">
            <button className="btn btn-ghost btn-sm" onClick={() => quickFill('student@gmail.com', 'Student@123')}>Student</button>
            <button className="btn btn-ghost btn-sm" onClick={() => quickFill('recruiter@technova.io', 'Recruiter@123')}>Recruiter</button>
            <button className="btn btn-ghost btn-sm" onClick={() => quickFill('admin@internhub.com', 'Admin@123')}>Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
