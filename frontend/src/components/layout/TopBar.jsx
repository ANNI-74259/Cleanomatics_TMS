import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTaskStats } from '../../context/TaskStatsContext';
import { completionPercent } from '../../utils/stats';
import { APP_NAME, USER_NAME } from '../../utils/constants';
import ThemeToggle from './ThemeToggle';

export default function TopBar({ theme, onToggleTheme }) {
  const { allTasks } = useTaskStats();
  const navigate = useNavigate();
  const [text, setText] = useState('');

  // Search from the top bar opens the board with the search already applied
  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <header className="topbar">
      <Link to="/" className="logo" aria-label={`${APP_NAME} home`}>
        <svg width="34" height="28" viewBox="0 0 34 28" aria-hidden="true">
          <path d="M14 2a12 12 0 1 0 0 24z" fill="var(--accent)" />
          <rect x="20" y="2" width="12" height="24" rx="6" fill="var(--text)" opacity="0.85" />
        </svg>
        <span>{APP_NAME}</span>
      </Link>

      <div className="stat-pill">
        <strong>{completionPercent(allTasks)}%</strong>
        <span>of tasks completed</span>
      </div>

      <div className="topbar__right">
        <form className="search-box" onSubmit={handleSearch} role="search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </form>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="avatar" aria-hidden="true">
          {USER_NAME.charAt(0)}
        </div>
      </div>
    </header>
  );
}
