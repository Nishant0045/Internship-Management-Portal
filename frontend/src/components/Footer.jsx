import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            Intern<span>Hub</span>
          </div>
          <p className="muted">The complete internship management portal — find internships, track applications, and hire top student talent.</p>
        </div>
        <div>
          <h4>Students</h4>
          <Link to="/browse">Browse internships</Link>
          <Link to="/register">Create account</Link>
          <Link to="/saved">Saved roles</Link>
        </div>
        <div>
          <h4>Recruiters</h4>
          <Link to="/register">Hire interns</Link>
          <Link to="/recruiter/post">Post an internship</Link>
          <Link to="/recruiter/applications">Manage applicants</Link>
        </div>
        <div>
          <h4>Portal</h4>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
      <div className="footer-bottom">InternHub • Full-stack project (React + Node.js + MongoDB)</div>
    </footer>
  );
}
