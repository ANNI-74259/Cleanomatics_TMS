// The "brain" of the app. All task logic and the in-memory data live here.
// Controllers call these functions. This file knows nothing about req/res.
const crypto = require('crypto');
const AppError = require('../utils/AppError');
const { PRIORITY_ORDER } = require('../constants/task.constants');

// In-memory storage: a normal array. It resets when the server restarts.
let tasks = [];

// ---------- helpers ----------

// Gives back the value we want to sort by
const getSortValue = (task, sortBy) => {
  if (sortBy === 'priority') return PRIORITY_ORDER[task.priority];
  return task[sortBy]; // createdAt or dueDate
};

const sortTasks = (list, sortBy, order) => {
  const direction = order === 'asc' ? 1 : -1;

  return list.sort((a, b) => {
    const first = getSortValue(a, sortBy);
    const second = getSortValue(b, sortBy);

    if (first === second) return 0;
    if (first === null) return 1; // tasks without due date always go last
    if (second === null) return -1;
    return first > second ? direction : -direction;
  });
};

const findTaskIndex = (id) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new AppError('Task not found', 404);
  }
  return index;
};

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

// ---------- main functions ----------

// Search + filter + sort + pagination all happen here
const getAllTasks = (query) => {
  const { search, status, priority, sortBy, order, page, limit } = query;

  let result = [...tasks]; // copy, so the original array is not changed

  if (search) {
    const text = search.toLowerCase();
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(text) ||
        task.description.toLowerCase().includes(text)
    );
  }
  if (status) {
    result = result.filter((task) => task.status === status);
  }
  if (priority) {
    result = result.filter((task) => task.priority === priority);
  }

  sortTasks(result, sortBy, order);

  const total = result.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  return { data, meta: { total, page, limit, totalPages } };
};

const getTaskById = (id) => {
  const index = findTaskIndex(id);
  return { ...tasks[index] };
};

const createTask = (data) => {
  const now = new Date().toISOString();

  const task = {
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate || null,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  return { ...task };
};

const updateTask = (id, data) => {
  const index = findTaskIndex(id);
  const existing = tasks[index];

  const updated = {
    ...existing,
    ...data,
    id: existing.id, // id can never change
    createdAt: existing.createdAt, // createdAt can never change
    updatedAt: new Date().toISOString(),
  };

  // "" means the user cleared the due date
  if ('dueDate' in data) {
    updated.dueDate = data.dueDate || null;
  }

  tasks[index] = updated;
  return { ...updated };
};

const deleteTask = (id) => {
  const index = findTaskIndex(id);
  tasks.splice(index, 1);
};

// Adds a few demo tasks so the dashboard is not empty on first run
const seedSampleTasks = () => {
  const samples = [
    {
      title: 'Complete assignment',
      description: 'Build the full-stack task manager',
      status: 'in_progress',
      priority: 'high',
      dueDate: daysFromNow(3),
    },
    {
      title: 'Prepare for interview',
      description: 'Revise React, Node.js and REST API basics',
      status: 'pending',
      priority: 'high',
      dueDate: daysFromNow(2),
    },
    {
      title: 'Update resume',
      description: 'Add the new projects and skills',
      status: 'pending',
      priority: 'medium',
      dueDate: null,
    },
    {
      title: 'Push code to GitHub',
      description: 'Create the repository and add a clear README',
      status: 'pending',
      priority: 'low',
      dueDate: daysFromNow(5),
    },
    {
      title: 'Set up project folders',
      description: 'Create the backend and frontend folders',
      status: 'completed',
      priority: 'medium',
      dueDate: daysFromNow(-1),
    },
  ];

  samples.forEach((sample) => createTask(sample));
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  seedSampleTasks,
};
