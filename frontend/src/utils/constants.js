// Fixed values used in many places.
export const APP_NAME = 'Cleanomatics TMS';
export const USER_NAME = 'Anirudh'; // shown in "Welcome, Anni!" - change it here

export const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// value = "sortBy:order" (split before sending to the API)
export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date (soonest)' },
  { value: 'dueDate:desc', label: 'Due date (latest)' },
  { value: 'priority:desc', label: 'Priority (high first)' },
  { value: 'priority:asc', label: 'Priority (low first)' },
];

export const statusLabel = (value) => STATUSES.find((s) => s.value === value)?.label || value;
export const priorityLabel = (value) => PRIORITIES.find((p) => p.value === value)?.label || value;
