import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';

const hasOwn = (obj: unknown, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj as Record<string, unknown>, key);

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

// Get all tasks
export const getTasks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// Get a single task by ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error });
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData: ITask = {
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'todo',
    };

    if (hasOwn(req.body, 'priority')) {
      const priority = req.body.priority;
      if (priority === null || priority === undefined || priority === '') {
        // ignore
      } else if (isFiniteNumber(priority)) {
        taskData.priority = priority;
      } else {
        res.status(400).json({ message: 'Invalid priority' });
        return;
      }
    }

    if (hasOwn(req.body, 'dueDate')) {
      const dueDate = req.body.dueDate;
      if (dueDate === null || dueDate === undefined || dueDate === '') {
        // ignore
      } else if (isFiniteNumber(dueDate)) {
        taskData.dueDate = new Date(dueDate * 1000);
      } else {
        res.status(400).json({ message: 'Invalid dueDate' });
        return;
      }
    }
    
    const task = new Task(taskData);
    const savedTask = await task.save();
    
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task', error });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, unknown> = {};

    if (hasOwn(req.body, 'title') && req.body.title !== undefined) {
      $set.title = req.body.title;
    }

    if (hasOwn(req.body, 'description') && req.body.description !== undefined) {
      $set.description = req.body.description;
    }

    if (hasOwn(req.body, 'status') && req.body.status !== undefined) {
      $set.status = req.body.status;
    }

    if (hasOwn(req.body, 'priority')) {
      const priority = req.body.priority;
      if (priority === null || priority === '' || priority === undefined) {
        $unset.priority = 1;
      } else if (isFiniteNumber(priority)) {
        $set.priority = priority;
      } else {
        res.status(400).json({ message: 'Invalid priority' });
        return;
      }
    }

    if (hasOwn(req.body, 'dueDate')) {
      const dueDate = req.body.dueDate;
      if (dueDate === null || dueDate === '' || dueDate === undefined) {
        $unset.dueDate = 1;
      } else if (isFiniteNumber(dueDate)) {
        $set.dueDate = new Date(dueDate * 1000);
      } else {
        res.status(400).json({ message: 'Invalid dueDate' });
        return;
      }
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    if (!Object.keys(update).length) {
      res.status(400).json({ message: 'No valid fields to update' });
      return;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task', error });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};
