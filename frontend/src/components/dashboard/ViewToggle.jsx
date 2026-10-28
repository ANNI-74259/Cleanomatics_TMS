import { LayoutGrid, List } from 'lucide-react';

// Board | List switch
export default function ViewToggle({ view, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label="Change view">
      <button
        type="button"
        className={view === 'board' ? 'is-active' : ''}
        onClick={() => onChange('board')}
        aria-pressed={view === 'board'}
      >
        <LayoutGrid size={16} /> Board
      </button>
      <button
        type="button"
        className={view === 'list' ? 'is-active' : ''}
        onClick={() => onChange('list')}
        aria-pressed={view === 'list'}
      >
        <List size={16} /> List
      </button>
    </div>
  );
}
