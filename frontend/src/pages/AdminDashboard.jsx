import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api/client';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import { formatDate } from '../utils/format';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    api.get('/dashboard/admin').then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'users') return;
    const query = new URLSearchParams({ page: String(page), limit: '10' });
    if (roleFilter) query.set('role', roleFilter);
    if (search) query.set('q', search);
    api.get(`/users?${query}`).then((res) => {
      setUsers(res.data.data || []);
      setUserPage(res.data.pagination);
    }).catch(() => {});
  }, [tab, roleFilter, search, page]);

  useEffect(() => {
    if (tab !== 'listings') return;
    api.get('/internships?status=all&limit=20').then((res) => setListings(res.data.data || [])).catch(() => {});
  }, [tab]);

  const changeUser = async (id, patch) => {
    try {
      await api.patch(`/users/${id}`, patch);
      setUsers((list) => list.map((u) => (u._id === id ? { ...u, ...patch } : u)));
    } catch (err) {
      alert(getError(err));
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((list) => list.filter((u) => u._id !== id));
    } catch (err) {
      alert(getError(err));
    }
  };

  const changeListingStatus = async (id, status) => {
    try {
      await api.patch(`/internships/${id}/status`, { status });
      setListings((list) => list.map((l) => (l._id === id ? { ...l, status } : l)));
    } catch (err) {
      alert(getError(err));
    }
  };

  if (loading) return <div className="container section"><Loader /></div>;
  if (!data) return <div className="container section"><p>Failed to load dashboard.</p></div>;

  return (
    <div className="container section">
      <h1 className="page-title">Admin console 🛠️</h1>
      <p className="muted">Platform overview, users and content moderation.</p>

      <div className="stats-grid">
        <StatCard icon="👥" label="Total users" value={data.users.total} />
        <StatCard icon="🎓" label="Students" value={data.users.students} />
        <StatCard icon="💼" label="Recruiters" value={data.users.recruiters} />
        <StatCard icon="📢" label="Listings" value={data.internships.total} />
        <StatCard icon="🟢" label="Open roles" value={data.internships.open} />
        <StatCard icon="📝" label="Applications" value={data.applications.total} />
      </div>

      <div className="tabs">
        {['overview', 'users', 'listings'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="dash-3col">
          <div className="card">
            <h3>Applications by status</h3>
            <div className="funnel">
              {Object.entries(data.applications.byStatus).map(([k, v]) => (
                <div key={k} className="funnel-row">
                  <span className="funnel-label">{k}</span>
                  <div className="funnel-bar"><div className="funnel-fill" style={{ width: `${(v / Math.max(1, data.applications.total)) * 100}%` }} /></div>
                  <b>{v}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>Newest users</h3>
            {data.recentUsers.map((u) => (
              <div key={u._id} className="mini-row">
                <span><b>{u.name}</b><small className="muted block">{u.email}</small></span>
                <span className="chip">{u.role}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Top listings</h3>
            {data.topInternships.map((j) => (
              <div key={j._id} className="mini-row">
                <span><Link to={`/internships/${j._id}`} className="link"><b>{j.title}</b></Link><small className="muted block">{j.company}</small></span>
                <b>{j.applicationsCount} 👥</b>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card table-card">
          <div className="toolbar">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email..." className="grow" />
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><b>{u.name}</b><small className="muted block">{u.email}</small></td>
                    <td>
                      <select value={u.role} onChange={(e) => changeUser(u._id, { role: e.target.value })}>
                        <option value="student">student</option>
                        <option value="recruiter">recruiter</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{u.isActive ? <span className="chip chip-ok">Active</span> : <span className="chip chip-bad">Blocked</span>}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => changeUser(u._id, { isActive: !u.isActive })}>
                        {u.isActive ? 'Block' : 'Unblock'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={userPage} onChange={setPage} />
        </div>
      )}

      {tab === 'listings' && (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Role</th><th>Posted by</th><th>Applicants</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l._id}>
                    <td><Link to={`/internships/${l._id}`} className="link"><b>{l.title}</b></Link><small className="muted block">{l.company}</small></td>
                    <td>{l.postedBy?.name || '—'}</td>
                    <td>{l.applicationsCount}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td className="row-actions">
                      <Link to={`/recruiter/edit/${l._id}`} className="btn btn-ghost btn-sm">Edit</Link>
                      {['open', 'closed', 'draft'].filter((s) => s !== l.status).map((s) => (
                        <button key={s} className="btn btn-ghost btn-sm" onClick={() => changeListingStatus(l._id, s)}>{s}</button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
