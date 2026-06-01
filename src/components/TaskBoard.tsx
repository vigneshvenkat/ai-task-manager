'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onCreateTask?: (status: TaskStatus) => void;
  onQuickCreateTask?: (title: string, status: TaskStatus) => Promise<void>;
}

interface Column {
  status: TaskStatus;
  label: string;
  accentBar: string;
  headerColor: string;
  countBg: string;
  dropRing: string;
  emptyText: string;
}

const columns: Column[] = [
  {
    status: 'todo',
    label: 'To Do',
    accentBar: 'bg-blue-500',
    headerColor: 'text-blue-400',
    countBg: 'bg-blue-500/15 text-blue-400',
    dropRing: 'ring-blue-500/40 bg-blue-500/5',
    emptyText: 'No tasks yet',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    accentBar: 'bg-amber-500',
    headerColor: 'text-amber-400',
    countBg: 'bg-amber-500/15 text-amber-400',
    dropRing: 'ring-amber-500/40 bg-amber-500/5',
    emptyText: 'Nothing in progress',
  },
  {
    status: 'done',
    label: 'Done',
    accentBar: 'bg-emerald-500',
    headerColor: 'text-emerald-400',
    countBg: 'bg-emerald-500/15 text-emerald-400',
    dropRing: 'ring-emerald-500/40 bg-emerald-500/5',
    emptyText: 'No completed tasks',
  },
];

export default function TaskBoard({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onCreateTask,
  onQuickCreateTask,
}: TaskBoardProps) {
  const COLUMN_LIMIT = 8;
  const [draggingId, setDraggingId]         = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [expandedCols, setExpandedCols]     = useState<Set<TaskStatus>>(new Set());
  const [quickAddCol, setQuickAddCol]       = useState<TaskStatus | null>(null);
  const [quickAddValue, setQuickAddValue]   = useState('');
  const [quickAddSaving, setQuickAddSaving] = useState(false);
  const quickAddRef = useRef<HTMLInputElement>(null);

  // Collapse expanded columns when filters change (tasks prop changes)
  useEffect(() => {
    setExpandedCols(new Set());
  }, [tasks]);

  // Focus the quick-add input whenever it opens
  useEffect(() => {
    if (quickAddCol !== null) {
      quickAddRef.current?.focus();
    }
  }, [quickAddCol]);

  const openQuickAdd = useCallback((status: TaskStatus) => {
    setQuickAddValue('');
    setQuickAddCol(status);
  }, []);

  const cancelQuickAdd = useCallback(() => {
    setQuickAddCol(null);
    setQuickAddValue('');
  }, []);

  const commitQuickAdd = useCallback(async (status: TaskStatus) => {
    const title = quickAddValue.trim();
    if (!title || !onQuickCreateTask) { cancelQuickAdd(); return; }
    setQuickAddSaving(true);
    try {
      await onQuickCreateTask(title, status);
    } finally {
      setQuickAddSaving(false);
      cancelQuickAdd();
    }
  }, [quickAddValue, onQuickCreateTask, cancelQuickAdd]);

  const toggleExpand = useCallback((status: TaskStatus) => {
    setExpandedCols(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  const handleDragStart = useCallback((taskId: string, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay so the ghost renders before we dim the original
    requestAnimationFrame(() => setDraggingId(taskId));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverColumn(null);
  }, []);

  const handleColumnDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumn(status);
    },
    []
  );

  const handleColumnDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Only clear when leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      if (taskId) {
        const task = tasks.find((t) => t._id === taskId);
        if (task && task.status !== targetStatus) {
          onStatusChange(taskId, targetStatus);
        }
      }
      setDraggingId(null);
      setDragOverColumn(null);
    },
    [tasks, onStatusChange]
  );

  const draggingTask = draggingId ? tasks.find((t) => t._id === draggingId) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
      {columns.map((col) => {
        const colTasks     = tasks.filter((t) => t.status === col.status);
        const isOver       = dragOverColumn === col.status;
        const canDrop      = draggingTask !== null && draggingTask?.status !== col.status;
        const showDropHighlight = isOver && canDrop;
        const isExpanded   = expandedCols.has(col.status);
        const hiddenCount  = colTasks.length - COLUMN_LIMIT;
        const visibleTasks = isExpanded ? colTasks : colTasks.slice(0, COLUMN_LIMIT);

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleColumnDragOver(e, col.status)}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-xl border transition-all duration-150 ${
              showDropHighlight
                ? `ring-2 ${col.dropRing} border-transparent`
                : 'border-zinc-800/60 bg-zinc-900/30'
            }`}
          >
            {/* Column header */}
            <div className="px-4 pt-4 pb-3">
              <div className={`h-0.5 w-8 rounded-full mb-3 ${col.accentBar}`} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold ${col.headerColor}`}>{col.label}</h3>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${col.countBg}`}>
                    {colTasks.length}
                  </span>
                </div>
                {onCreateTask && (
                  <button
                    onClick={() => onCreateTask(col.status)}
                    className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors text-base leading-none"
                    title={`Add task to ${col.label}`}
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Drop indicator */}
            {showDropHighlight && (
              <div className="mx-4 mb-2">
                <div className={`h-0.5 rounded-full opacity-70 ${col.accentBar}`} />
              </div>
            )}

            {/* Cards */}
            <div className="flex-1 px-3 pb-3 space-y-2.5 overflow-y-auto min-h-30">
              {colTasks.length === 0 && !showDropHighlight && (
                <div className="flex flex-col items-center justify-center h-28 border border-dashed border-zinc-700/50 rounded-lg mt-1">
                  <p className="text-xs text-zinc-600">{col.emptyText}</p>
                  {onCreateTask && (
                    <button
                      onClick={() => onCreateTask(col.status)}
                      className="mt-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      + Add a task
                    </button>
                  )}
                </div>
              )}

              {colTasks.length === 0 && showDropHighlight && (
                <div className={`h-28 rounded-lg border-2 border-dashed ${
                  col.status === 'todo' ? 'border-blue-500/30' :
                  col.status === 'in_progress' ? 'border-amber-500/30' : 'border-emerald-500/30'
                } flex items-center justify-center`}>
                  <p className="text-xs text-zinc-500">Drop here</p>
                </div>
              )}

              {visibleTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isDragging={draggingId === task._id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                />
              ))}

              {hiddenCount > 0 && !isExpanded && (
                <button
                  onClick={() => toggleExpand(col.status)}
                  className={`w-full py-2 text-xs font-medium transition-colors rounded-lg border border-dashed ${
                    col.status === 'todo'        ? 'border-blue-800/60 text-blue-500/70 hover:text-blue-400 hover:border-blue-600/60' :
                    col.status === 'in_progress' ? 'border-amber-800/60 text-amber-500/70 hover:text-amber-400 hover:border-amber-600/60' :
                                                   'border-emerald-800/60 text-emerald-500/70 hover:text-emerald-400 hover:border-emerald-600/60'
                  }`}
                >
                  Show {hiddenCount} more
                </button>
              )}

              {isExpanded && colTasks.length > COLUMN_LIMIT && (
                <button
                  onClick={() => toggleExpand(col.status)}
                  className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors rounded-lg hover:bg-zinc-800/40"
                >
                  Show less
                </button>
              )}

              {/* Quick-add input */}
              {onQuickCreateTask && quickAddCol === col.status ? (
                <div className="mt-1">
                  <input
                    ref={quickAddRef}
                    type="text"
                    value={quickAddValue}
                    onChange={(e) => setQuickAddValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')  commitQuickAdd(col.status);
                      if (e.key === 'Escape') cancelQuickAdd();
                    }}
                    onBlur={() => { if (!quickAddSaving) cancelQuickAdd(); }}
                    disabled={quickAddSaving}
                    placeholder="Task name… then Enter"
                    className="w-full bg-zinc-800 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1 px-1">Enter to save · Esc to cancel</p>
                </div>
              ) : (
                onQuickCreateTask && (
                  <button
                    onClick={() => openQuickAdd(col.status)}
                    className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 transition-colors group/add mt-1"
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-sm leading-none transition-colors ${
                      col.status === 'todo'        ? 'group-hover/add:text-blue-400' :
                      col.status === 'in_progress' ? 'group-hover/add:text-amber-400' :
                                                     'group-hover/add:text-emerald-400'
                    }`}>+</span>
                    Add task
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
