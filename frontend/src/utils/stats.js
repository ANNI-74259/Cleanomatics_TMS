// Numbers for the dashboard widgets. All of them are calculated from the task list.
import { daysUntil, toYMD, todayYMD } from './formatDate';

export const isOverdue = (task) =>
  Boolean(task.dueDate) && task.status !== 'completed' && daysUntil(task.dueDate) < 0;

export const isDueSoon = (task) =>
  Boolean(task.dueDate) &&
  task.status !== 'completed' &&
  daysUntil(task.dueDate) >= 0 &&
  daysUntil(task.dueDate) <= 3;

export const hasNoDueDate = (task) => !task.dueDate;

// Filters that the backend does not support, so the frontend applies them
export const QUICK_FILTERS = {
  dueSoon: isDueSoon,
  overdue: isOverdue,
  noDue: hasNoDueDate,
};

export function completionPercent(tasks) {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.status === 'completed').length;
  return Math.round((done / tasks.length) * 100);
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Monday to Sunday of this week: how many tasks are due each day
export function dueThisWeek(tasks) {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday + i);
    const key = toYMD(day);
    return {
      label: DAY_LABELS[day.getDay()],
      count: tasks.filter((task) => task.dueDate === key).length,
      isToday: key === todayYMD(),
    };
  });
}

// Last 7 days (ending today): how many tasks were completed each day (uses updatedAt)
export function completedLast7Days(tasks) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    const key = toYMD(day);
    return {
      label: DAY_LABELS[day.getDay()],
      count: tasks.filter(
        (task) => task.status === 'completed' && toYMD(new Date(task.updatedAt)) === key
      ).length,
    };
  });
}

const plural = (n, one, many) => (n === 1 ? one : many);

// Short messages for the Smart Insights card. "filter" is the shortcut it opens.
export function getInsights(tasks) {
  const insights = [];

  const overdue = tasks.filter(isOverdue).length;
  if (overdue > 0) {
    insights.push({
      text: `${overdue} ${plural(overdue, 'task is', 'tasks are')} overdue. Finish ${plural(overdue, 'it', 'them')} first.`,
      filter: 'overdue',
    });
  }

  const soon = tasks.filter(isDueSoon).length;
  if (soon > 0) {
    insights.push({
      text: `${soon} ${plural(soon, 'task is', 'tasks are')} due in the next 3 days.`,
      filter: 'dueSoon',
    });
  }

  const urgent = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;
  if (urgent > 0) {
    insights.push({
      text: `${urgent} high priority ${plural(urgent, 'task is', 'tasks are')} still open.`,
      filter: 'high',
    });
  }

  const doneThisWeek = completedLast7Days(tasks).reduce((sum, day) => sum + day.count, 0);
  insights.push({
    text: `You completed ${doneThisWeek} ${plural(doneThisWeek, 'task', 'tasks')} in the last 7 days.`,
    filter: 'completed',
  });

  return insights;
}
