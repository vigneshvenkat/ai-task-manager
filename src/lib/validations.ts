import type { TaskStatus, TaskPriority } from '@/types';

const VALID_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCreateTask(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const input = data as Record<string, unknown>;

  if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (input.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  if (input.description !== undefined) {
    if (typeof input.description !== 'string') {
      errors.push('Description must be a string');
    } else if (input.description.length > 2000) {
      errors.push('Description must be 2000 characters or less');
    }
  }

  if (!input.status) {
    errors.push('Status is required');
  } else if (!VALID_STATUSES.includes(input.status as TaskStatus)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (!input.priority) {
    errors.push('Priority is required');
  } else if (!VALID_PRIORITIES.includes(input.priority as TaskPriority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (input.assignee !== undefined && typeof input.assignee !== 'string') {
    errors.push('Assignee must be a string');
  }

  if (input.dueDate !== undefined) {
    if (typeof input.dueDate !== 'string' || isNaN(Date.parse(input.dueDate))) {
      errors.push('Due date must be a valid date string');
    }
  }

  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags)) {
      errors.push('Tags must be an array');
    } else if (!(input.tags as unknown[]).every((t) => typeof t === 'string')) {
      errors.push('Each tag must be a string');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateTask(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const input = data as Record<string, unknown>;

  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (input.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
  }

  if (input.description !== undefined && typeof input.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (input.status !== undefined && !VALID_STATUSES.includes(input.status as TaskStatus)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (input.priority !== undefined && !VALID_PRIORITIES.includes(input.priority as TaskPriority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
