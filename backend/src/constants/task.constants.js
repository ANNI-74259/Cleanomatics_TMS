// Fixed lists used in many places (validator, service).
// Keeping them here means we change a value only once.

const STATUSES = ['pending', 'in_progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];
const SORT_FIELDS = ['createdAt', 'priority', 'dueDate'];

// Used when sorting by priority (high is the biggest number)
const PRIORITY_ORDER = {
  low: 1,
  medium: 2,
  high: 3,
};

module.exports = { STATUSES, PRIORITIES, SORT_FIELDS, PRIORITY_ORDER };
