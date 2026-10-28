import { isDueSoon, isOverdue, hasNoDueDate } from '../../utils/stats';

// Small cards with a live count. Clicking one filters the board.
const SHORTCUTS = [
  { key: 'high', label: 'High Priority', sub: 'Needs attention', count: (t) => t.filter((x) => x.priority === 'high').length },
  { key: 'dueSoon', label: 'Due Soon', sub: 'Next 3 days', count: (t) => t.filter(isDueSoon).length },
  { key: 'overdue', label: 'Overdue', sub: 'Past deadline', count: (t) => t.filter(isOverdue).length },
  { key: 'inProgress', label: 'In Progress', sub: 'Working on it', count: (t) => t.filter((x) => x.status === 'in_progress').length },
  { key: 'completed', label: 'Completed', sub: 'All done', count: (t) => t.filter((x) => x.status === 'completed').length },
  { key: 'noDue', label: 'No Due Date', sub: 'Not scheduled', count: (t) => t.filter(hasNoDueDate).length },
];

export default function ShortcutCards({ tasks, active, onSelect }) {
  return (
    <div className="shortcuts">
      {SHORTCUTS.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`shortcut${active === item.key ? ' is-active' : ''}`}
          onClick={() => onSelect(item.key)}
          aria-pressed={active === item.key}
        >
          <span>
            <span className="shortcut__label">{item.label}</span>
            <br />
            <span className="shortcut__sub">{item.sub}</span>
          </span>
          <span className="shortcut__count">{item.count(tasks)}</span>
        </button>
      ))}
    </div>
  );
}
