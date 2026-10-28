import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, PieChart, Plus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

// Round icon buttons on the left (bottom bar on mobile).
export default function SideRail({ theme, onToggleTheme }) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onDashboard = pathname === '/';
  const isList = searchParams.get('view') === 'list';

  const goToStats = () => {
    navigate('/');
    setTimeout(() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <nav className="rail" aria-label="Main navigation">
      <Link
        to="/?view=board"
        className={`icon-btn${onDashboard && !isList ? ' is-active' : ''}`}
        aria-label="Board view"
        title="Board"
      >
        <LayoutGrid size={20} />
      </Link>
      <Link
        to="/?view=list"
        className={`icon-btn${onDashboard && isList ? ' is-active' : ''}`}
        aria-label="List view"
        title="List"
      >
        <List size={20} />
      </Link>
      <button type="button" className="icon-btn" onClick={goToStats} aria-label="Stats" title="Stats">
        <PieChart size={20} />
      </button>
      <Link
        to="/tasks/new"
        className={`icon-btn${pathname === '/tasks/new' ? ' is-active' : ''}`}
        aria-label="New task"
        title="New task"
      >
        <Plus size={20} />
      </Link>

      <div className="rail__spacer" />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </nav>
  );
}
