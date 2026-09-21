import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import InternshipCard from '../components/InternshipCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [meta, setMeta] = useState({ categories: [], locations: [], modes: [], skills: [] });
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [mode, setMode] = useState(params.get('mode') || '');
  const [location, setLocation] = useState('');
  const [minStipend, setMinStipend] = useState('');
  const [sort, setSort] = useState('newest');
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/internships/meta').then((res) => setMeta(res.data)).catch(() => {});
  }, []);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const query = new URLSearchParams({
      ...(q && { q }),
      ...(category && { category }),
      ...(mode && { mode }),
      ...(location && { location }),
      ...(minStipend && { minStipend }),
      sort,
      page: String(page),
      limit: '9',
    });
    api
      .get(`/internships?${query}`)
      .then((res) => {
        setJobs(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, category, mode, location, minStipend, sort, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Keep URL in sync for shareable searches
  useEffect(() => {
    const next = {};
    if (q) next.q = q;
    if (category) next.category = category;
    if (page > 1) next.page = String(page);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, page]);

  const clearFilters = () => {
    setQ('');
    setCategory('');
    setMode('');
    setLocation('');
    setMinStipend('');
    setSort('newest');
    setParams({}, { replace: true });
  };

  return (
    <div className="container section">
      <h1 className="page-title">Browse internships</h1>
      <p className="muted">{pagination ? `${pagination.total} open role${pagination.total === 1 ? '' : 's'} found` : 'Finding roles...'}</p>

      <div className="browse-layout">
        <aside className="filters card">
          <div className="filters-head">
            <h3>Filters</h3>
            <button className="link-btn" onClick={clearFilters}>Clear all</button>
          </div>
          <label>
            Search
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Role, company, skill..." />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {meta.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Work mode
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="">Any mode</option>
              {meta.modes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Anywhere</option>
              {meta.locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            Minimum stipend (₹/month)
            <select value={minStipend} onChange={(e) => setMinStipend(e.target.value)}>
              <option value="">Any</option>
              <option value="10000">₹10,000+</option>
              <option value="25000">₹25,000+</option>
              <option value="40000">₹40,000+</option>
              <option value="60000">₹60,000+</option>
            </select>
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="popular">Most popular</option>
              <option value="stipend_high">Stipend: high → low</option>
              <option value="stipend_low">Stipend: low → high</option>
              <option value="deadline">Closing soon</option>
            </select>
          </label>
        </aside>

        <div className="browse-main">
          {loading ? (
            <Loader />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No internships match your filters"
              text="Try broadening your search or clearing some filters."
              action={<button className="btn btn-primary" onClick={clearFilters}>Clear filters</button>}
            />
          ) : (
            <>
              <div className="jobs-grid jobs-grid-2">
                {jobs.map((job) => (
                  <InternshipCard key={job._id} job={job} />
                ))}
              </div>
              <Pagination pagination={pagination} onChange={(p) => setParams({ ...Object.fromEntries(params), page: String(p) })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
