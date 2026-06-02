'use client';

import type { Task, TaskPriority, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  isDragging?: boolean;
  onDragStart?: (taskId: string, e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

const priorityConfig: Record<TaskPriority, { label: string; badge: string; border: string; dot: string }> = {
  critical: { label: 'Critical', badge: 'bg-red-500/15 text-red-400 border-red-500/25',    border: 'border-l-red-500',    dot: 'bg-red-500' },
  high:     { label: 'High',     badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25', border: 'border-l-orange-500', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', border: 'border-l-yellow-500', dot: 'bg-yellow-500' },
  low:      { label: 'Low',      badge: 'bg-green-500/15 text-green-400 border-green-500/25',   border: 'border-l-green-500',  dot: 'bg-green-500' },
};

const statusConfig: Record<TaskStatus, { label: string; badge: string; next: TaskStatus | null }> = {
  todo:        { label: 'To Do',       badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',      next: 'in_progress' },
  in_progress: { label: 'In Progress', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',   next: 'done' },
  done:        { label: 'Done',        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', next: null },
};

function formatDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateStr: string | undefined, status: TaskStatus): boolean {
  if (!dateStr || status === 'done') return false;
  return new Date(dateStr) < new Date();
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const overdue = isOverdue(task.dueDate, task.status);
  const formattedDate = formatDate(task.dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(task._id, e)}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(task)}
      className={`group relative bg-zinc-900 border border-zinc-800 border-l-[3px] ${priority.border} rounded-lg p-3.5 cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging
          ? 'opacity-30 scale-[0.97] shadow-none'
          : 'hover:border-zinc-700 hover:border-l-[3px] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
      }`}
    >
      {/* Drag handle — visible on hover */}
      <div
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 pointer-events-none"
        aria-hidden
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
          <circle cx="2" cy="2"  r="1.5" />
          <circle cx="8" cy="2"  r="1.5" />
          <circle cx="2" cy="7"  r="1.5" />
          <circle cx="8" cy="7"  r="1.5" />
          <circle cx="2" cy="12" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-zinc-100 leading-snug mb-1.5 pr-5 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700/80 rounded-md px-1.5 py-px"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-zinc-600 self-center">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Priority + date */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`inline-flex items-center gap-1 text-xs border rounded-md px-1.5 py-px ${priority.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dot}`} />
            {priority.label}
          </span>

          {formattedDate && (
            <span className={`text-xs shrink-0 flex items-center gap-0.5 ${overdue ? 'text-red-400' : 'text-zinc-500'}`}>
              {overdue && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              )}
              {!overdue && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                </svg>
              )}
              {formattedDate}
            </span>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <div
            className="w-5 h-5 shrink-0 rounded-full bg-amber-600 flex items-center justify-center text-xs font-semibold text-white"
            title={task.assignee}
          >
            {task.assignee.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Hover quick-actions (stop propagation so they don't open edit modal) */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {status.next && (
          <button
            onClick={() => onStatusChange(task._id, status.next!)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors px-1.5 py-0.5 rounded hover:bg-amber-500/10"
            title={`Move to ${statusConfig[status.next!].label}`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(task._id)}
          className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
          title="Delete task"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { priorityConfig, statusConfig };
