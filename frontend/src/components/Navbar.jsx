import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';
import api from '../api/client';
import { initials } from '../utils/format';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = () =>
      api
        .get('/notifications?limit=1')
        .then((res) => alive && setUnread(res.data.unreadCount || 0))
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="nav-wrap">
      <div className="nav container">
        <Link to="/" className="brand">
          Intern<span>Hub</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/browse">Browse Internships</NavLink>
          {user?.role === 'student' && <NavLink to="/saved">Saved</NavLink>}
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.role === 'recruiter' && <NavLink to="/recruiter/post">Post Internship</NavLink>}
        </nav>
        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/notifications" className="icon-btn" title="Notifications">
                🔔{unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
              </Link>
              <div className="avatar-menu">
                <button className="avatar-btn" onClick={() => setOpen((o) => !o)} title={user.name}>
                  {user.avatar ? <img src={user.avatar} alt={user.name} /> : initials(user.name)}
                </button>
                {open && (
                  <div className="menu" onMouseLeave={() => setOpen(false)}>
                    <div className="menu-head">
                      <b>{user.name}</b>
                      <small>{user.role}</small>
                    </div>
                    <Link to={dashboardPath(user.role)} onClick={() => setOpen(false)}>My Dashboard</Link>
                    <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
