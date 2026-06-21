function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

export default function JobCard({ job, onEdit, onDelete, onStatusChange }) {
  const days = daysSince(job.appliedDate || job.createdAt);

  return (
    <div className={`job-card status-${job.status.toLowerCase()}`}>
      <div className="job-card-top">
        <div>
          <h4 className="job-card-company">{job.company}</h4>
          <p className="job-card-role">{job.role}</p>
        </div>
        <div className="job-card-menu">
          <button className="icon-btn" onClick={() => onEdit(job)} title="Edit" aria-label="Edit job">
            ✎
          </button>
          <button className="icon-btn icon-btn-danger" onClick={() => onDelete(job)} title="Delete" aria-label="Delete job">
            ×
          </button>
        </div>
      </div>

      {job.notes && <p className="job-card-notes">{job.notes}</p>}

      <div className="job-card-bottom">
        <span className="job-card-days">
          {days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`}
        </span>
        {job.link && (
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-card-link">
            Listing ↗
          </a>
        )}
      </div>

      <select
        className="job-card-status-select"
        value={job.status}
        onChange={(e) => onStatusChange(job, e.target.value)}
        aria-label="Change status"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
