import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import InternshipCard from '../components/InternshipCard.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = [
  { name: 'Software Engineering', icon: '💻' },
  { name: 'Web Development', icon: '🌐' },
  { name: 'AI & Data Science', icon: '🤖' },
  { name: 'Data Analyst', icon: '📊' },
  { name: 'UI/UX Design', icon: '🎨' },
  { name: 'Digital Marketing', icon: '📣' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/internships/featured')
      .then((res) => setFeatured(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">INTERNSHIP MANAGEMENT PORTAL</p>
            <h1>
              Find your next <span>internship.</span>
            </h1>
            <p className="hero-sub">
              Discover curated internships, apply in one click, track every application —
              and hire top student talent if you're a recruiter.
            </p>
            <form className="hero-search" onSubmit={(e) => { e.preventDefault(); navigate(`/browse?q=${encodeURIComponent(q)}`); }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try 'React', 'Data', 'Design'..." />
              <button className="btn btn-primary" type="submit">Search</button>
            </form>
            <div className="hero-cta">
              <Link to="/browse" className="btn btn-light">Browse all internships</Link>
              <Link to="/register" className="btn btn-outline-light">I'm hiring →</Link>
            </div>
          </div>
          <div className="hero-card card">
            <h3>How it works</h3>
            <ol className="steps">
              <li><b>Students</b> create a profile & upload a resume</li>
              <li><b>Apply</b> to curated internships in one click</li>
              <li><b>Track</b> shortlists, interviews & offers live</li>
              <li><b>Recruiters</b> post roles & manage applicants</li>
            </ol>
            <div className="hero-stats">
              <div><b>12+</b><small>Categories</small></div>
              <div><b>1-click</b><small>Apply</small></div>
              <div><b>Live</b><small>Tracking</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Explore by category</h2>
          <Link to="/browse" className="link">View all →</Link>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={`/browse?category=${encodeURIComponent(c.name)}`} className="card cat-card">
              <span className="cat-icon">{c.icon}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Featured internships</h2>
          <Link to="/browse" className="link">View all →</Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="jobs-grid">
            {featured.map((job) => (
              <InternshipCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Hiring interns for your team?</h2>
            <p>Post a role in 2 minutes and manage applicants with a built-in pipeline.</p>
          </div>
          <Link to="/register" className="btn btn-light btn-lg">Post an internship — it's free</Link>
        </div>
      </section>
    </>
  );
}
