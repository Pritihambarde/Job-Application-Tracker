export default function FilterBar({ search, onSearchChange, status, onStatusChange, sort, onSortChange, onExport }) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          placeholder="Search by company or role…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search applications"
        />
        {search && (
          <button type="button" className="search-clear" onClick={() => onSearchChange('')} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <select
        className="filter-select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        <option value="Applied">Applied</option>
        <option value="Interviewing">Interviewing</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>

      <select
        className="filter-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort applications"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="company">Company A–Z</option>
        <option value="updated">Recently updated</option>
      </select>

      <button className="btn-ghost-solid filter-export" onClick={onExport}>
        Export CSV
      </button>
    </div>
  );
}
