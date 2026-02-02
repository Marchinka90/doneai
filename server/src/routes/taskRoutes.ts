import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';

const router = Router();

// GET /api/tasks - Get all tasks
router.get('/', getTasks);

// GET /api/tasks/:id - Get a single task
router.get('/:id', getTaskById);

// POST /api/tasks - Create a new task
router.post('/', createTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

export default router;
