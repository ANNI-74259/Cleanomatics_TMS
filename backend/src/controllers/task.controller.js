// Controllers are thin: take data from the request, call the service,
// and send the response with the right status code.
const taskService = require('../services/task.service');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/tasks
const getAllTasks = asyncHandler(async (req, res) => {
  const { data, meta } = taskService.getAllTasks(req.query);
  res.status(200).json({ success: true, data, meta });
});

// GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = taskService.getTaskById(req.params.id);
  res.status(200).json({ success: true, data: task });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const task = taskService.createTask(req.body);
  res.status(201).json({ success: true, data: task });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = taskService.updateTask(req.params.id, req.body);
  res.status(200).json({ success: true, data: task });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  taskService.deleteTask(req.params.id);
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
