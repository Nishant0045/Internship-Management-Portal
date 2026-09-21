const map = {
  Applied: 'st-applied',
  'Under Review': 'st-review',
  Shortlisted: 'st-shortlisted',
  Interview: 'st-interview',
  Selected: 'st-selected',
  Rejected: 'st-rejected',
  Withdrawn: 'st-withdrawn',
  open: 'st-selected',
  closed: 'st-rejected',
  draft: 'st-review',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${map[status] || 'st-applied'}`}>{status}</span>;
}
