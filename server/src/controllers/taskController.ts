import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';

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
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
      },
      { new: true, runValidators: true }
    );
    
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
