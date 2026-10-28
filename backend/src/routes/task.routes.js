// Routes only connect a URL + method to middleware and a controller.
// No business logic here.
const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} = require('../validators/task.validator');

const router = express.Router();

router.get('/', validate(listTasksQuerySchema, 'query'), taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
