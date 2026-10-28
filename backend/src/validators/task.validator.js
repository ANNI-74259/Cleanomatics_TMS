// Rules for the data coming from the client (Joi library).
// If data breaks a rule, the validate middleware returns a 400 error.
const Joi = require('joi');
const { STATUSES, PRIORITIES, SORT_FIELDS } = require('../constants/task.constants');

// Checks that a "YYYY-MM-DD" string is a real calendar date (no 2026-02-31)
const isRealDate = (value, helpers) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isValid ? value : helpers.error('any.invalid');
};

// Rules for each single field (shared by create and update)
const fields = {
  title: Joi.string().trim().min(3).max(100).messages({
    'string.base': 'Title must be text',
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be at most 100 characters',
    'any.required': 'Title is required',
  }),

  description: Joi.string().trim().max(500).messages({
    'string.base': 'Description must be text',
    'string.empty': 'Description is required',
    'string.max': 'Description must be at most 500 characters',
    'any.required': 'Description is required',
  }),

  status: Joi.string()
    .valid(...STATUSES)
    .messages({ 'any.only': `Status must be one of: ${STATUSES.join(', ')}` }),

  priority: Joi.string()
    .valid(...PRIORITIES)
    .messages({ 'any.only': `Priority must be one of: ${PRIORITIES.join(', ')}` }),

  // Due date is optional. null or "" means "no due date".
  dueDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom(isRealDate)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Due date must be in YYYY-MM-DD format',
      'any.invalid': 'Due date is not a valid date',
    }),
};

// POST /api/tasks  (title and description are required)
const createTaskSchema = Joi.object({
  title: fields.title.required(),
  description: fields.description.required(),
  status: fields.status.default('pending'),
  priority: fields.priority.default('medium'),
  dueDate: fields.dueDate.default(null),
});

// PUT /api/tasks/:id  (every field is optional, but send at least one)
const updateTaskSchema = Joi.object(fields)
  .min(1)
  .messages({ 'object.min': 'Send at least one field to update' });

// GET /api/tasks?search=&status=&priority=&sortBy=&order=&page=&limit=
const listTasksQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).allow('').default(''),
  status: Joi.string().valid(...STATUSES).allow('').default(''),
  priority: Joi.string().valid(...PRIORITIES).allow('').default(''),
  sortBy: Joi.string().valid(...SORT_FIELDS).default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = { createTaskSchema, updateTaskSchema, listTasksQuerySchema };
