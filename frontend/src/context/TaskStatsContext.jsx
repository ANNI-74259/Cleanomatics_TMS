// Keeps ONE list of all tasks (up to 100) for the numbers on the dashboard:
// top bar percentage, shortcut counts, charts and insights.
// The board has its own filtered list (see DashboardPage).
import { createContext, useContext } from 'react';
import useTasks from '../hooks/useTasks';

const TaskStatsContext = createContext(null);

export function TaskStatsProvider({ children }) {
  const { tasks, loading, error, refetch } = useTasks({ limit: 100 });

  const value = {
    allTasks: tasks,
    statsLoading: loading,
    statsError: error,
    refreshStats: (silent = true) => refetch(silent),
  };

  return <TaskStatsContext.Provider value={value}>{children}</TaskStatsContext.Provider>;
}

export function useTaskStats() {
  return useContext(TaskStatsContext);
}
