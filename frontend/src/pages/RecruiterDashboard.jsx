import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, initials } from '../utils/format';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/recruiter')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container section"><Loader /></div>;
  if (!data) return <div className="container section"><p>Failed to load dashboard.</p></div>;

  const s = data.stats;
  const funnelOrder = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
  const funnelMax = Math.max(1, ...funnelOrder.map((k) => data.funnel[k] || 0));

  return (
    <div className="container section">
      <div className="page-head">
        <div>
          <h1 className="page-title">Recruiter dashboard 💼</h1>
          <p className="muted">{user?.company || 'Your company'} — manage listings & applicants.</p>
        </div>
        <Link to="/recruiter/post" className="btn btn-primary btn-lg">+ Post internship</Link>
      </div>

      <div className="stats-grid">
        <StatCard icon="📢" label="Roles posted" value={s.posted} />
        <StatCard icon="🟢" label="Active roles" value={s.active} />
        <StatCard icon="👥" label="Total applicants" value={s.totalApplicants} />
        <StatCard icon="⭐" label="Shortlisted" value={s.shortlisted} />
        <StatCard icon="🎉" label="Selected" value={s.selected} />
      </div>

      <div className="dash-2col">
        <div className="card">
          <div className="section-head">
            <h3>My listings</h3>
            <Link to="/recruiter/post" className="link">+ New role</Link>
          </div>
          {data.myInternships.length === 0 ? (
            <EmptyState
              title="No listings yet"
              text="Post your first internship to start receiving applications."
              action={<Link to="/recruiter/post" className="btn btn-primary">Post an internship</Link>}
            />
          ) : (
            <div className="listing-rows">
              {data.myInternships.map((j) => (
                <div key={j._id} className="listing-row">
                  <div>
                    <Link to={`/internships/${j._id}`} className="link"><b>{j.title}</b></Link>
                    <div className="muted small">{j.applicationsCount || 0} applicants • {formatDate(j.createdAt)}</div>
                  </div>
                  <div className="row-actions">
                    <StatusBadge status={j.status} />
                    <Link to={`/recruiter/applications?internshipId=${j._id}`} className="btn btn-ghost btn-sm">Applicants</Link>
                    <Link to={`/recruiter/edit/${j._id}`} className="btn btn-ghost btn-sm">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <h3>Applicant funnel</h3>
            <div className="funnel">
              {funnelOrder.map((k) => (
                <div key={k} className="funnel-row">
                  <span className="funnel-label">{k}</span>
                  <div className="funnel-bar">
                    <div className="funnel-fill" style={{ width: `${((data.funnel[k] || 0) / funnelMax) * 100}%` }} />
                  </div>
                  <b>{data.funnel[k] || 0}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-head">
              <h3>Recent applicants</h3>
              <Link to="/recruiter/applications" className="link">View all →</Link>
            </div>
            {data.recentApplications.length === 0 ? (
              <p className="muted">No applications yet.</p>
            ) : (
              <div className="applicant-mini">
                {data.recentApplications.map((a) => (
                  <Link key={a._id} to={`/applications/${a._id}`} className="mini-row">
                    <span className="mini-avatar">{initials(a.student?.name)}</span>
                    <span className="mini-info">
                      <b>{a.student?.name}</b>
                      <small className="muted">{a.internship?.title}</small>
                    </span>
                    <StatusBadge status={a.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
