import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../api/client';
import JobCard from '../components/JobCard';
import JobModal from '../components/JobModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatsPanel from '../components/StatsPanel';
import FilterBar from '../components/FilterBar';
import VerifyBanner from '../components/VerifyBanner';
import './Dashboard.css';

const COLUMNS = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modalJob, setModalJob] = useState(undefined); // undefined = closed, null = new, object = edit
  const [pendingDelete, setPendingDelete] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');

  // Debounce search input so we don't fire a request on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setLoadError('');
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter) params.status = statusFilter;
        if (sort) params.sort = sort;

        const [jobsRes, statsRes] = await Promise.all([
          api.get('/jobs', { params }),
          api.get('/jobs/stats'),
        ]);

        if (!cancelled) {
          setJobs(jobsRes.data);
          setStats(statsRes.data);
        }
      } catch {
        if (!cancelled) setLoadError('Could not load your applications. Try refreshing.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, sort, retryToken]);

  const refreshStats = async () => {
    try {
      const res = await api.get('/jobs/stats');
      setStats(res.data);
    } catch {
      // Stats are supplementary — fail silently rather than disrupting the board
    }
  };

  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c, []]));
    for (const job of jobs) {
      (map[job.status] ?? map.Applied).push(job);
    }
    return map;
  }, [jobs]);

  const handleSave = async (form) => {
    if (modalJob) {
      const res = await api.put(`/jobs/${modalJob._id}`, form);
      setJobs((prev) => prev.map((j) => (j._id === modalJob._id ? res.data : j)));
      showToast('Application updated', 'success');
    } else {
      const res = await api.post('/jobs', form);
      setJobs((prev) => [res.data, ...prev]);
      showToast('Application added', 'success');
    }
    setModalJob(undefined);
    refreshStats();
  };

  const handleStatusChange = async (job, status) => {
    const prev = jobs;
    setJobs((cur) => cur.map((j) => (j._id === job._id ? { ...j, status } : j)));
    try {
      await api.put(`/jobs/${job._id}`, { status });
      showToast(`Moved to ${status}`, 'success');
      refreshStats();
    } catch {
      setJobs(prev);
      showToast('Could not update status', 'error');
    }
  };

  const handleDeleteConfirmed = async () => {
    const job = pendingDelete;
    setPendingDelete(null);
    const prev = jobs;
    setJobs((cur) => cur.filter((j) => j._id !== job._id));
    try {
      await api.delete(`/jobs/${job._id}`);
      showToast('Application deleted', 'success');
      refreshStats();
    } catch {
      setJobs(prev);
      showToast('Could not delete application', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/jobs/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pipeline-applications.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export downloaded', 'success');
    } catch {
      showToast('Could not export — try again', 'error');
    }
  };

  const hasActiveFilters = search || statusFilter || sort !== 'newest';
  const total = jobs.length;

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-logo">
          <span className="auth-logo-mark">→</span>
          Pipeline
        </div>
        <div className="dash-header-right">
          <span className="dash-user">{user?.name}</span>
          <button className="btn-ghost-solid" onClick={logout}>Log out</button>
        </div>
      </header>

      {user && !user.isVerified && <VerifyBanner />}

      <main className="dash-main">
        <div className="dash-toolbar">
          <div>
            <h1 className="dash-title">Your pipeline</h1>
            <p className="dash-subtitle">
              {stats?.total === 0
                ? 'Nothing logged yet — add your first application below.'
                : `${stats?.total ?? '—'} application${stats?.total === 1 ? '' : 's'} tracked`}
            </p>
          </div>
          <button className="auth-submit dash-add-btn" onClick={() => setModalJob(null)}>
            + Add application
          </button>
        </div>

        <StatsPanel stats={stats} />

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          sort={sort}
          onSortChange={setSort}
          onExport={handleExport}
        />

        {loadError && (
          <div className="auth-error dash-error">
            {loadError}{' '}
            <button className="dash-retry" onClick={() => setRetryToken((n) => n + 1)}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <BoardSkeleton />
        ) : total === 0 && hasActiveFilters ? (
          <div className="dash-no-results">
            No applications match your filters.
            <button
              className="dash-retry"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setSort('newest');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="board">
            {COLUMNS.map((col) => (
              <div className="board-col" key={col}>
                <div className="board-col-header">
                  <span className={`status-dot dot-${col.toLowerCase()}`} />
                  <span>{col}</span>
                  <span className="board-col-count">{grouped[col].length}</span>
                </div>
                <div className="board-col-body">
                  {grouped[col].length === 0 ? (
                    <div className="board-empty">No applications here</div>
                  ) : (
                    grouped[col].map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        onEdit={(j) => setModalJob(j)}
                        onDelete={(j) => setPendingDelete(j)}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalJob !== undefined && (
        <JobModal
          key={modalJob ? modalJob._id : 'new'}
          job={modalJob}
          onClose={() => setModalJob(undefined)}
          onSave={handleSave}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this application?"
          message={`This will permanently remove ${pendingDelete.company} — ${pendingDelete.role} from your pipeline.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="board">
      {COLUMNS.map((col) => (
        <div className="board-col" key={col}>
          <div className="board-col-header">
            <span className={`status-dot dot-${col.toLowerCase()}`} />
            <span>{col}</span>
          </div>
          <div className="board-col-body">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      ))}
    </div>
  );
}
