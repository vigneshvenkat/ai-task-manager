import mongoose, { Schema, Document, Model } from 'mongoose';
import type { Task } from '@/types';

export interface TaskDocument extends Omit<Task, '_id'>, Document {}

const TaskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      required: true,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignee: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const TaskModel: Model<TaskDocument> =
  (mongoose.models.Task as Model<TaskDocument>) ||
  mongoose.model<TaskDocument>('Task', TaskSchema);

export default TaskModel;
