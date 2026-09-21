import { Link } from 'react-router-dom';
import { stipend, timeAgo } from '../utils/format';

export default function InternshipCard({ job }) {
  return (
    <article className="card job-card">
      <div className="job-top">
        <div className="company-logo">{(job.company || '?')[0]}</div>
        <div>
          <div className="job-company">{job.company}</div>
          <div className="muted small">{job.location} • {job.mode}</div>
        </div>
        {job.isFeatured && <span className="badge-featured">Featured</span>}
      </div>
      <Link to={`/internships/${job._id}`} className="job-title">{job.title}</Link>
      <div className="chips">
        <span className="chip">{job.category}</span>
        <span className="chip">{job.jobType}</span>
        <span className="chip">{job.duration}</span>
        {(job.skills || []).slice(0, 3).map((s) => (
          <span key={s} className="chip chip-skill">{s}</span>
        ))}
      </div>
      <div className="job-foot">
        <b className="stipend">{stipend(job.stipendMin, job.stipendMax)}</b>
        <span className="muted small">{timeAgo(job.createdAt)} • {job.applicationsCount || 0} applicants</span>
      </div>
      <Link to={`/internships/${job._id}`} className="btn btn-primary btn-block">View & Apply</Link>
    </article>
  );
}
