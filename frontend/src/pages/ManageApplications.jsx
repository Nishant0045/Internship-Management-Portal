import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, initials } from '../utils/format';

const STATUSES = ['', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export default function ManageApplications() {
  const [params, setParams] = useSearchParams();
  const [apps, setApps] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [myRoles, setMyRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const internshipId = params.get('internshipId') || '';
  const status = params.get('status') || '';
  const [search, setSearch] = useState(params.get('search') || '');
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/internships?mine=true&limit=50').then((res) => setMyRoles(res.data.data || [])).catch(() => {});
  }, []);

  const fetchApps = useCallback(() => {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), limit: '10' });
    if (internshipId) query.set('internshipId', internshipId);
    if (status) query.set('status', status);
    if (search) query.set('search', search);
    api
      .get(`/applications/recruiter?${query}`)
      .then((res) => {
        setApps(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [internshipId, status, search, page]);

  useEffect(() => {
    const t = setTimeout(fetchApps, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchApps, search]);

  const update = (patch) => {
    const next = { internshipId, status, search, page: '1', ...patch };
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    delete next.page;
    if (patch.page) next.page = String(patch.page);
    setParams(next, { replace: true });
  };

  return (
    <div className="container section">
      <h1 className="page-title">Manage applicants</h1>
      <p className="muted">{pagination ? `${pagination.total} application${pagination.total === 1 ? '' : 's'}` : ''}</p>

      <div className="toolbar card">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, college..." className="grow" />
        <select value={internshipId} onChange={(e) => update({ internshipId: e.target.value })}>
          <option value="">All my roles</option>
          {myRoles.map((r) => <option key={r._id} value={r._id}>{r.title} ({r.status})</option>)}
        </select>
        <select value={status} onChange={(e) => update({ status: e.target.value })}>
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : apps.length === 0 ? (
        <EmptyState title="No applications found" text="Try different filters, or share your listings to get applicants." />
      ) : (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Candidate</th><th>Role</th><th>Applied</th><th>Rating</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="candidate">
                        <span className="mini-avatar">{initials(a.student?.name)}</span>
                        <span>
                          <b>{a.student?.name}</b>
                          <small className="muted block">{a.student?.college || a.student?.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>{a.internship?.title}</td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>{a.rating ? `⭐ ${a.rating}/5` : <span className="muted">—</span>}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td><Link to={`/applications/${a._id}`} className="btn btn-primary btn-sm">Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onChange={(p) => update({ page: p })} />
        </div>
      )}
    </div>
  );
}
