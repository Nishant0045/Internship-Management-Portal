import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate } from '../utils/format';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/student')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container section"><Loader /></div>;
  if (!data) return <div className="container section"><p>Failed to load dashboard.</p></div>;

  const s = data.stats;

  return (
    <div className="container section">
      <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="muted">Track your applications and discover roles matched to your skills.</p>

      {data.profileCompletion < 100 && (
        <div className="alert alert-info">
          Your profile is {data.profileCompletion}% complete.{' '}
          <Link to="/profile" className="link">Complete it</Link> to get better recommendations.
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon="📝" label="Applications" value={s.applied} />
        <StatCard icon="👀" label="Under review" value={s.underReview} />
        <StatCard icon="⭐" label="Shortlisted" value={s.shortlisted} />
        <StatCard icon="🎤" label="Interviews" value={s.interviews} />
        <StatCard icon="🎉" label="Selected" value={s.selected} />
      </div>

      <div className="dash-2col">
        <div className="card">
          <div className="section-head">
            <h3>Recent applications</h3>
            <Link to="/browse" className="link">Find more →</Link>
          </div>
          {data.recentApplications.length === 0 ? (
            <EmptyState
              icon="🚀"
              title="No applications yet"
              text="Browse internships and submit your first application."
              action={<Link to="/browse" className="btn btn-primary">Browse internships</Link>}
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Role</th><th>Company</th><th>Applied</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.recentApplications.map((a) => (
                    <tr key={a._id}>
                      <td><Link to={`/applications/${a._id}`} className="link"><b>{a.internship?.title}</b></Link></td>
                      <td>{a.internship?.company}</td>
                      <td>{formatDate(a.createdAt)}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <div className="quick-actions">
            <Link to="/browse" className="btn btn-primary">🔍 Browse internships</Link>
            <Link to="/saved" className="btn btn-ghost">★ Saved roles</Link>
            <Link to="/profile" className="btn btn-ghost">👤 Edit profile & resume</Link>
            <Link to="/notifications" className="btn btn-ghost">🔔 Notifications</Link>
          </div>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <h2>Recommended for you</h2>
        <Link to="/browse" className="link">View all →</Link>
      </div>
      {data.recommended.length === 0 ? (
        <p className="muted">Add skills to your <Link to="/profile" className="link">profile</Link> to get personalized recommendations.</p>
      ) : (
        <div className="jobs-grid">
          {data.recommended.map((job) => (
            <InternshipCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
