export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ViewMode = 'board' | 'list' | 'dashboard' | 'calendar';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface AISuggestion {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  breakdown?: string[];
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}
