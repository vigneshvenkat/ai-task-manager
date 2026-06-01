'use client';

import { useMemo } from 'react';
import type { Task, TaskPriority } from '@/types';

interface DashboardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; textColor: string; barColor: string; dotColor: string }> = {
  critical: { label: 'Critical', textColor: 'text-red-400',    barColor: 'bg-red-500',    dotColor: 'bg-red-500' },
  high:     { label: 'High',     textColor: 'text-orange-400', barColor: 'bg-orange-500', dotColor: 'bg-orange-500' },
  medium:   { label: 'Medium',   textColor: 'text-yellow-400', barColor: 'bg-yellow-500', dotColor: 'bg-yellow-500' },
  low:      { label: 'Low',      textColor: 'text-green-400',  barColor: 'bg-green-500',  dotColor: 'bg-green-500' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 6) return formatDate(dateStr);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function DonutChart({ todo, inProgress, done, total }: { todo: number; inProgress: number; done: number; total: number }) {
  const r = 36;
  const C = 2 * Math.PI * r;
  const GAP = total > 1 ? 2 : 0;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;

  const segments = [
    { value: todo,       stroke: '#3b82f6' },
    { value: inProgress, stroke: '#f59e0b' },
    { value: done,       stroke: '#10b981' },
  ].filter(s => s.value > 0);

  let accumulated = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#27272a" strokeWidth={10} />
      {total === 0 ? (
        <text x={50} y={52} textAnchor="middle" style={{ fontSize: '9px', fill: '#71717a' }}>No tasks</text>
      ) : (
        <>
          <g transform="rotate(-90, 50, 50)">
            {segments.map((seg, i) => {
              const segLen = (seg.value / total) * C - GAP;
              const offset = -accumulated;
              accumulated += (seg.value / total) * C;
              return (
                <circle
                  key={i}
                  cx={50} cy={50} r={r}
                  fill="none"
                  stroke={seg.stroke}
                  strokeWidth={10}
                  strokeDasharray={`${Math.max(0, segLen)} ${C}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                />
              );
            })}
          </g>
          <text x={50} y={47} textAnchor="middle" style={{ fontSize: '18px', fontWeight: '700', fill: 'white' }}>{completion}%</text>
          <text x={50} y={60} textAnchor="middle" style={{ fontSize: '8px', fill: '#6b7280' }}>done</text>
        </>
      )}
    </svg>
  );
}

export default function Dashboard({ tasks, onEditTask }: DashboardProps) {
  const {
    total,
    todo,
    inProgress,
    done,
    overdueTasks,
    upcomingTasks,
    recentTasks,
    priorityCounts,
    completion,
  } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(todayStart);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todo        = tasks.filter(t => t.status === 'todo').length;
    const inProgress  = tasks.filter(t => t.status === 'in_progress').length;
    const done        = tasks.filter(t => t.status === 'done').length;
    const total       = tasks.length;
    const completion  = total > 0 ? Math.round((done / total) * 100) : 0;

    const overdueTasks = tasks
      .filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < todayStart)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 6);

    const upcomingTasks = tasks
      .filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate) >= todayStart && new Date(t.dueDate) <= nextWeek)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 6);

    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    const priorityCounts: Record<TaskPriority, number> = {
      critical: tasks.filter(t => t.priority === 'critical').length,
      high:     tasks.filter(t => t.priority === 'high').length,
      medium:   tasks.filter(t => t.priority === 'medium').length,
      low:      tasks.filter(t => t.priority === 'low').length,
    };

    return { total, todo, inProgress, done, overdueTasks, upcomingTasks, recentTasks, priorityCounts, completion };
  }, [tasks]);

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Tasks"
          value={total}
          accent="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <KpiCard
          label="In Progress"
          value={inProgress}
          accent="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <KpiCard
          label="Completed"
          value={`${completion}%`}
          sub={`${done} of ${total}`}
          accent="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Overdue"
          value={overdueTasks.length}
          accent={overdueTasks.length > 0 ? 'red' : 'gray'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status donut */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-4">Status Distribution</p>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 shrink-0">
              <DonutChart todo={todo} inProgress={inProgress} done={done} total={total} />
            </div>
            <div className="space-y-3 flex-1">
              <DonutLegend color="bg-blue-500"    label="To Do"       value={todo}       total={total} />
              <DonutLegend color="bg-amber-500"   label="In Progress" value={inProgress} total={total} />
              <DonutLegend color="bg-emerald-500" label="Done"        value={done}       total={total} />
            </div>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-4">Priority Breakdown</p>
          {total === 0 ? (
            <EmptyState label="No tasks yet" />
          ) : (
            <div className="space-y-3.5">
              {((['critical', 'high', 'medium', 'low'] as TaskPriority[])).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const count = priorityCounts[p];
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={p}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
                      <span className="text-xs text-zinc-500 tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue + Upcoming */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-4">Due Dates</p>
          {overdueTasks.length === 0 && upcomingTasks.length === 0 ? (
            <EmptyState label="No upcoming or overdue tasks" />
          ) : (
            <div className="space-y-1">
              {overdueTasks.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest px-1 mb-1.5">Overdue</p>
                  {overdueTasks.map(task => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      dateLabel={formatDate(task.dueDate!)}
                      dateClass="text-red-400"
                      onEdit={onEditTask}
                    />
                  ))}
                </>
              )}
              {upcomingTasks.length > 0 && (
                <>
                  <p className={`text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-1 mb-1.5 ${overdueTasks.length > 0 ? 'mt-3' : ''}`}>
                    Next 7 days
                  </p>
                  {upcomingTasks.map(task => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      dateLabel={formatDate(task.dueDate!)}
                      dateClass="text-zinc-500"
                      onEdit={onEditTask}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-4">Recently Created</p>
          {recentTasks.length === 0 ? (
            <EmptyState label="No tasks created yet" />
          ) : (
            <div className="space-y-1">
              {recentTasks.map(task => (
                <TaskRow
                  key={task._id}
                  task={task}
                  dateLabel={formatRelative(task.createdAt)}
                  dateClass="text-zinc-600"
                  onEdit={onEditTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ACCENT_MAP = {
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20'  },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20'},
  red:    { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20'    },
  gray:   { bg: 'bg-zinc-800',      text: 'text-zinc-500',   border: 'border-zinc-700'      },
};

function KpiCard({ label, value, sub, accent, icon }: {
  label: string;
  value: string | number;
  sub?: string;
  accent: keyof typeof ACCENT_MAP;
  icon: React.ReactNode;
}) {
  const a = ACCENT_MAP[accent];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg ${a.bg} border ${a.border} flex items-center justify-center ${a.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DonutLegend({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      <span className="text-xs text-zinc-400 flex-1">{label}</span>
      <span className="text-xs text-zinc-500 tabular-nums">{value}</span>
      <span className="text-xs text-zinc-600 tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
}

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

const PRIORITY_DOT: Record<TaskPriority, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-green-500',
};

function TaskRow({ task, dateLabel, dateClass, onEdit }: {
  task: Task;
  dateLabel: string;
  dateClass: string;
  onEdit: (task: Task) => void;
}) {
  return (
    <button
      onClick={() => onEdit(task)}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors text-left group"
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />
      <span className="flex-1 text-xs text-zinc-300 truncate group-hover:text-zinc-100 transition-colors">
        {task.title}
      </span>
      <span className={`text-[10px] shrink-0 border rounded px-1 py-px ${STATUS_BADGE[task.status]}`}>
        {STATUS_LABEL[task.status]}
      </span>
      <span className={`text-[10px] shrink-0 tabular-nums ${dateClass}`}>{dateLabel}</span>
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-xs text-zinc-600">{label}</p>
    </div>
  );
}
