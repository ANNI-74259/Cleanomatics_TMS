// Main page: header, shortcuts, charts, Kanban board / list, completed chart.
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useTasks from '../hooks/useTasks';
import useDebounce from '../hooks/useDebounce';
import { useTaskStats } from '../context/TaskStatsContext';
import { useToast } from '../components/ui/Toast';
import { updateTask, deleteTask } from '../api/taskApi';
import { STATUSES, USER_NAME, statusLabel } from '../utils/constants';
import { formatTime } from '../utils/formatDate';
import { QUICK_FILTERS, dueThisWeek, completedLast7Days, getInsights } from '../utils/stats';

import ShortcutCards from '../components/dashboard/ShortcutCards';
import DueThisWeekChart from '../components/dashboard/DueThisWeekChart';
import SmartInsights from '../components/dashboard/SmartInsights';
import CompletedChart from '../components/dashboard/CompletedChart';
import BoardToolbar from '../components/dashboard/BoardToolbar';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskListTable from '../components/tasks/TaskListTable';
import Pagination from '../components/tasks/Pagination';
import ConfirmDeleteModal from '../components/tasks/ConfirmDeleteModal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const NO_FILTERS = { priority: '', status: '', quick: '' };

export default function DashboardPage() {
  const { allTasks, refreshStats } = useTaskStats();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // ----- state -----
  const view = searchParams.get('view') === 'list' ? 'list' : 'board';
  const urlQuery = searchParams.get('q');
  const [search, setSearch] = useState(urlQuery || '');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // search typed in the top bar arrives as ?q=...
  useEffect(() => {
    if (urlQuery !== null) setSearch(urlQuery);
  }, [urlQuery]);

  const debouncedSearch = useDebounce(search, 400);
  const [sortBy, order] = sort.split(':');

  // Pagination is only used in the list view. The board loads up to 100 tasks.
  const usePaging = view === 'list' && !filters.quick;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, sort, view]);

  const params = {
    search: debouncedSearch.trim(),
    priority: filters.priority,
    status: filters.status,
    sortBy,
    order,
    page: usePaging ? page : 1,
    limit: usePaging ? 10 : 100,
  };

  const { tasks, setTasks, meta, loading, error, refetch } = useTasks(params);

  // Due Soon / Overdue / No Due Date are filtered here (the backend does not know them)
  const visibleTasks = filters.quick ? tasks.filter(QUICK_FILTERS[filters.quick]) : tasks;
  const hasFilters = Boolean(search.trim() || filters.priority || filters.status || filters.quick);

  // ----- numbers for the widgets -----
  const insights = useMemo(() => getInsights(allTasks), [allTasks]);
  const weekDays = useMemo(() => dueThisWeek(allTasks), [allTasks]);
  const completedData = useMemo(() => completedLast7Days(allTasks), [allTasks]);
  const completedTotal = completedData.reduce((sum, day) => sum + day.count, 0);
  const lastUpdated = useMemo(() => {
    if (allTasks.length === 0) return null;
    return new Date(Math.max(...allTasks.map((task) => new Date(task.updatedAt).getTime())));
  }, [allTasks]);

  // ----- shortcut cards -----
  let activeShortcut = filters.quick;
  if (!activeShortcut && !filters.priority && filters.status === 'in_progress') activeShortcut = 'inProgress';
  if (!activeShortcut && !filters.priority && filters.status === 'completed') activeShortcut = 'completed';
  if (!activeShortcut && !filters.status && filters.priority === 'high') activeShortcut = 'high';

  const applyShortcut = (key, allowToggle = true) => {
    if (allowToggle && key === activeShortcut) {
      setFilters(NO_FILTERS);
      return;
    }
    const next = { ...NO_FILTERS };
    if (key === 'high') next.priority = 'high';
    else if (key === 'inProgress') next.status = 'in_progress';
    else if (key === 'completed') next.status = 'completed';
    else next.quick = key;
    setFilters(next);
    document.getElementById('board')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearAll = () => {
    setSearch('');
    setFilters(NO_FILTERS);
  };

  const changeView = (newView) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('view', newView);
      return next;
    });
  };

  // ----- drag and drop (optimistic update, rolls back if the API fails) -----
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const previousTasks = tasks;
    setTasks((list) => list.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task)));

    try {
      await updateTask(draggableId, { status: newStatus });
      showToast(`Moved to ${statusLabel(newStatus)}`);
      refreshStats();
    } catch (err) {
      setTasks(previousTasks);
      showToast(err.message || 'Could not move the task', 'error');
    }
  };

  // ----- delete -----
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      showToast('Task deleted');
      setTaskToDelete(null);
      refetch(true);
      refreshStats();
    } catch (err) {
      showToast(err.message || 'Could not delete the task', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ----- what to show inside the board card -----
  let content;
  if (error) {
    content = <ErrorState message={error} onRetry={() => refetch()} />;
  } else if (loading && tasks.length === 0) {
    content =
      view === 'board' ? (
        <div className="board">
          {STATUSES.map((status) => (
            <div className="column" key={status.value}>
              <div className="column__head">
                <h3 className="column__name">{status.label}</h3>
              </div>
              <div className="column__body">
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="center"><Spinner /></div>
      );
  } else if (!hasFilters && tasks.length === 0) {
    content = (
      <EmptyState
        title="No tasks yet"
        text="Create your first task to get started."
        actionLabel="Create your first task"
        actionTo="/tasks/new"
      />
    );
  } else if (hasFilters && visibleTasks.length === 0) {
    content = (
      <EmptyState
        title="No tasks match your filters"
        text="Try a different search or clear the filters."
        actionLabel="Clear filters"
        onAction={clearAll}
      />
    );
  } else if (view === 'board') {
    content = <KanbanBoard tasks={visibleTasks} onDragEnd={handleDragEnd} onDelete={setTaskToDelete} />;
  } else {
    content = (
      <>
        <TaskListTable tasks={visibleTasks} onDelete={setTaskToDelete} />
        {usePaging && meta && meta.totalPages > 1 && (
          <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
        )}
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="page-head">
        <div className="greeting">
          <h1>Welcome, {USER_NAME}!</h1>
          <p>Plan, track and finish your tasks every day.</p>
        </div>
        <div className="head-actions">
          <Link to="/tasks/new" className="btn-plus" aria-label="New task" title="New task">
            <Plus size={28} />
          </Link>
          <ShortcutCards tasks={allTasks} active={activeShortcut} onSelect={applyShortcut} />
        </div>
      </div>

      {/* Row 1 */}
      <div className="row-2" id="stats">
        <section className="card card--tab-left">
          <div className="card__head">
            <h2 className="card__title">Due This Week</h2>
            <span className="muted">Mon - Sun</span>
          </div>
          <DueThisWeekChart days={weekDays} />
        </section>
        <SmartInsights insights={insights} onView={(key) => applyShortcut(key, false)} />
      </div>

      {/* Task board / list */}
      <section className="card board-card" id="board">
        <div className="card__head">
          <h2 className="card__title">Task Board</h2>
          {lastUpdated && (
            <span className="last-updated">
              <span className="dot" /> Last updated {formatTime(lastUpdated)}
            </span>
          )}
        </div>

        <BoardToolbar
          search={search}
          onSearch={setSearch}
          priority={filters.priority}
          onPriority={(value) => setFilters((current) => ({ ...current, priority: value }))}
          sort={sort}
          onSort={setSort}
          view={view}
          onView={changeView}
          hasFilters={hasFilters}
          onClear={clearAll}
        />

        {content}
      </section>

      {/* Row 3 */}
      <section className="card">
        <div className="card__head">
          <h2 className="card__title">Completed Tasks</h2>
          <span className="pill">{completedTotal} in the last 7 days</span>
        </div>
        <CompletedChart data={completedData} />
      </section>

      {taskToDelete && (
        <ConfirmDeleteModal
          task={taskToDelete}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </>
  );
}
