import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import InternshipCard from '../components/InternshipCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Saved() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/saved').then((res) => setJobs(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container section"><Loader /></div>;

  return (
    <div className="container section">
      <h1 className="page-title">Saved internships ★</h1>
      <p className="muted">{jobs.length} saved role{jobs.length === 1 ? '' : 's'}</p>
      {jobs.length === 0 ? (
        <EmptyState
          icon="★"
          title="No saved roles yet"
          text="Tap the star on any internship to save it here for later."
          action={<Link to="/browse" className="btn btn-primary">Browse internships</Link>}
        />
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => <InternshipCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
