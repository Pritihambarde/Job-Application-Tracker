import { useId, useState } from 'react';
import { useModalA11y } from '../hooks/useModalA11y';

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

const EMPTY_FORM = {
  company: '',
  role: '',
  status: 'Applied',
  link: '',
  notes: '',
};

function initialFormFor(job) {
  if (!job) return EMPTY_FORM;
  return {
    company: job.company || '',
    role: job.role || '',
    status: job.status || 'Applied',
    link: job.link || '',
    notes: job.notes || '',
  };
}

export default function JobModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(() => initialFormFor(job));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();
  const dialogRef = useModalA11y(onClose);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.company.trim() || !form.role.trim()) {
      setError('Company and role are required.');
      return;
    }
    setSubmitting(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not save. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId}>{job ? 'Edit application' : 'Add application'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <div className="field">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Acme Corp"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Product Designer"
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="link">Listing link <span className="field-optional">(optional)</span></label>
            <input
              id="link"
              name="link"
              type="url"
              value={form.link}
              onChange={handleChange}
              placeholder="https://"
            />
          </div>

          <div className="field">
            <label htmlFor="notes">Notes <span className="field-optional">(optional)</span></label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Referred by Alex. Recruiter call scheduled for Thursday."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost-solid" onClick={onClose}>Cancel</button>
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Saving…' : job ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
