import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask {
  title: string;
  description: string;
  status: TaskStatus;
  priority?: number;
  dueDate?: Date;
}

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be one of: todo, in-progress, done',
      },
      default: 'todo',
    },
    priority: {
      type: Number,
      min: [1, 'Priority must be between 1 and 9'],
      max: [9, 'Priority must be between 1 and 9'],
      validate: {
        validator: (value: number) => Number.isInteger(value),
        message: 'Priority must be an integer',
      },
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const anyRet = ret as any;
        const { _id, __v, ...rest } = anyRet;
        const createdAt = anyRet.createdAt;
        const updatedAt = anyRet.updatedAt;
        const dueDate = anyRet.dueDate;

        const toUnixSeconds = (value: unknown): number | undefined => {
          if (!value) return undefined;
          const ms = value instanceof Date ? value.getTime() : new Date(value as any).getTime();
          return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined;
        };

        const out: Record<string, unknown> = {
          id: _id.toString(),
          ...rest,
        };

        const createdAtSeconds = toUnixSeconds(createdAt);
        if (createdAtSeconds !== undefined) out.createdAt = createdAtSeconds;

        const updatedAtSeconds = toUnixSeconds(updatedAt);
        if (updatedAtSeconds !== undefined) out.updatedAt = updatedAtSeconds;

        const dueDateSeconds = toUnixSeconds(dueDate);
        if (dueDateSeconds !== undefined) out.dueDate = dueDateSeconds;

        return out;
      },
    },
  }
);

const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;
