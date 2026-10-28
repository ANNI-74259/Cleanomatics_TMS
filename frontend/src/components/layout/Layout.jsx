import { TaskStatsProvider } from '../../context/TaskStatsContext';
import useTheme from '../../hooks/useTheme';
import TopBar from './TopBar';
import SideRail from './SideRail';

// Page frame: top bar + icon rail + the page content.
export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <TaskStatsProvider>
      <div className="app">
        <TopBar theme={theme} onToggleTheme={toggleTheme} />
        <SideRail theme={theme} onToggleTheme={toggleTheme} />
        <main className="main">{children}</main>
      </div>
    </TaskStatsProvider>
  );
}
