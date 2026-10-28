import { Search } from 'lucide-react';
import ViewToggle from './ViewToggle';
import Button from '../ui/Button';
import { PRIORITIES, SORT_OPTIONS } from '../../utils/constants';

// Search + priority filter + sort + Board/List switch.
export default function BoardToolbar({
  search, onSearch,
  priority, onPriority,
  sort, onSort,
  view, onView,
  hasFilters, onClear,
}) {
  return (
    <div className="toolbar">
      <label className="search-box">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search tasks..."
          aria-label="Search tasks"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>

      <select
        className="pill-select"
        aria-label="Filter by priority"
        value={priority}
        onChange={(event) => onPriority(event.target.value)}
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <select
        className="pill-select"
        aria-label="Sort tasks"
        value={sort}
        onChange={(event) => onSort(event.target.value)}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {hasFilters && (
        <Button variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      )}

      <ViewToggle view={view} onChange={onView} />
    </div>
  );
}
