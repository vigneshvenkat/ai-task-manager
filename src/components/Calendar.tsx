'use client';

import { useState, useMemo } from 'react';
import type { Task, TaskPriority } from '@/types';

interface CalendarProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const PRIORITY_CHIP: Record<TaskPriority, string> = {
  critical: 'bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25',
  high:     'bg-orange-500/15 text-orange-300 border border-orange-500/25 hover:bg-orange-500/25',
  medium:   'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25 hover:bg-yellow-500/25',
  low:      'bg-green-500/15 text-green-300 border border-green-500/25 hover:bg-green-500/25',
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-green-500',
};

const STATUS_BADGE: Record<string, string> = {
  todo:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  done:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Prog',
  done: 'Done',
};

const DAYS    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS  = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Calendar({ tasks, onEditTask }: CalendarProps) {
  const [today] = useState<Date>(() => new Date());
  const [current, setCurrent] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [expanded, setExpanded] = useState<string | null>(null);

  const prevMonth = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday   = () => {
    setCurrent(new Date(today.getFullYear(), today.getMonth(), 1));
    setExpanded(null);
  };

  const { cells, tasksByDate } = useMemo(() => {
    const year  = current.getFullYear();
    const month = current.getMonth();
    const startPad = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const total    = Math.ceil((startPad + lastDate) / 7) * 7;

    const cells: Date[] = [];
    for (let i = 0; i < total; i++) {
      cells.push(new Date(year, month, 1 - startPad + i));
    }

    const tasksByDate: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const key = task.dueDate.split('T')[0];
        if (!tasksByDate[key]) tasksByDate[key] = [];
        tasksByDate[key].push(task);
      }
    });

    return { cells, tasksByDate };
  }, [current, tasks]);

  const undated  = useMemo(() => tasks.filter(t => !t.dueDate), [tasks]);
  const todayKey = toDateKey(today);
  const curMonth = current.getMonth();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">
          {MONTHS[current.getMonth()]} {current.getFullYear()}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Previous month"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Next month"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {DAYS.map(day => (
            <div key={day} className="py-2.5 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const key            = toDateKey(date);
            const isCurrentMonth = date.getMonth() === curMonth;
            const isToday        = key === todayKey;
            const dayTasks       = tasksByDate[key] ?? [];
            const isExpanded     = expanded === key;
            const MAX_VISIBLE    = 3;
            const overflow       = dayTasks.length > MAX_VISIBLE ? dayTasks.length - MAX_VISIBLE : 0;
            const visible        = isExpanded ? dayTasks : dayTasks.slice(0, MAX_VISIBLE);
            const isWeekEnd      = i % 7 === 6; // last column, no right border needed

            return (
              <div
                key={toDateKey(date)}
                className={`min-h-27 flex flex-col gap-1 p-2 border-b border-r border-zinc-800 ${
                  isWeekEnd ? 'border-r-0' : ''
                } ${!isCurrentMonth ? 'bg-zinc-950/50' : ''}`}
              >
                {/* Date number */}
                <div className="flex justify-end mb-0.5">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium tabular-nums ${
                    isToday
                      ? 'bg-amber-600 text-white font-semibold'
                      : isCurrentMonth
                        ? 'text-zinc-400'
                        : 'text-zinc-700'
                  }`}>
                    {date.getDate()}
                  </span>
                </div>

                {/* Task chips */}
                {visible.map(task => (
                  <button
                    key={task._id}
                    onClick={() => onEditTask(task)}
                    title={task.title}
                    className={`w-full flex items-center gap-1 px-1.5 py-0.75 rounded text-left text-[11px] leading-4 transition-colors ${PRIORITY_CHIP[task.priority]} ${
                      task.status === 'done' ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                    <span className="truncate">{task.title}</span>
                  </button>
                ))}

                {/* Overflow toggle */}
                {overflow > 0 && !isExpanded && (
                  <button
                    onClick={() => setExpanded(key)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 pl-1 text-left transition-colors"
                  >
                    +{overflow} more
                  </button>
                )}
                {isExpanded && (
                  <button
                    onClick={() => setExpanded(null)}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 pl-1 text-left transition-colors"
                  >
                    show less
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks with no due date */}
      {undated.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">
            No Due Date — {undated.length} task{undated.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {undated.map(task => (
              <button
                key={task._id}
                onClick={() => onEditTask(task)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${PRIORITY_CHIP[task.priority]} ${
                  task.status === 'done' ? 'opacity-50' : ''
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                <span>{task.title}</span>
                <span className={`ml-0.5 border rounded px-1 py-px text-[9px] ${STATUS_BADGE[task.status]}`}>
                  {STATUS_LABEL[task.status]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
