'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Task, TaskStatus } from '@/types';
import { priorityConfig, statusConfig } from './TaskCard';
import Pagination from './Pagination';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr: string | undefined, status: TaskStatus): boolean {
  if (!dateStr || status === 'done') return false;
  return new Date(dateStr) < new Date();
}

export default function TaskList({ tasks, onEditTask, onDeleteTask, onStatusChange }: TaskListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  // Reset to page 1 whenever the task list (filters) changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tasks.slice(start, start + pageSize);
  }, [tasks, currentPage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-2xl mb-4">
          ◈
        </div>
        <p className="text-sm font-medium text-zinc-400">No tasks found</p>
        <p className="text-xs text-zinc-600 mt-1">Create your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_120px_140px_120px_80px] gap-4 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          <span>Task</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Assignee</span>
          <span>Due Date</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/60">
          {paginated.map((task) => {
            const priority = priorityConfig[task.priority];
            const status   = statusConfig[task.status];
            const overdue  = isOverdue(task.dueDate, task.status);

            return (
              <div
                key={task._id}
                className="group grid grid-cols-[1fr_120px_120px_140px_120px_80px] gap-4 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/50 transition-colors cursor-pointer items-center"
                onClick={() => onEditTask(task)}
              >
                {/* Title + tags */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{task.description}</p>
                  )}
                  {task.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {task.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded px-1.5 py-px">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs border rounded px-1.5 py-0.5 ${priority.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                    {priority.label}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex text-xs border rounded px-1.5 py-0.5 ${status.badge}`}>
                    {status.label}
                  </span>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {task.assignee ? (
                    <>
                      <div className="w-5 h-5 shrink-0 rounded-full bg-amber-600 flex items-center justify-center text-xs font-medium text-white">
                        {task.assignee.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-zinc-400 truncate">{task.assignee}</span>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-600">Unassigned</span>
                  )}
                </div>

                {/* Due date */}
                <div>
                  <span className={`text-xs ${overdue ? 'text-red-400' : 'text-zinc-500'}`}>
                    {overdue && '⚠ '}
                    {formatDate(task.dueDate)}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {status.next && (
                    <button
                      onClick={() => onStatusChange(task._id, status.next!)}
                      className="text-xs text-zinc-400 hover:text-amber-400 transition-colors px-1.5 py-1 rounded hover:bg-amber-500/10"
                      title={`Move to ${statusConfig[status.next!].label}`}
                    >
                      →
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteTask(task._id)}
                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-1.5 py-1 rounded hover:bg-red-500/10"
                    title="Delete task"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={tasks.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
