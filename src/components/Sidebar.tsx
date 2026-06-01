'use client';

import type { TaskPriority, TaskStatus, ViewMode } from '@/types';

interface SidebarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  filterStatus: TaskStatus | 'all';
  onFilterStatus: (status: TaskStatus | 'all') => void;
  filterPriority: TaskPriority | 'all';
  onFilterPriority: (priority: TaskPriority | 'all') => void;
  taskCounts: Record<TaskStatus | 'all', number>;
}

function BoardIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 20 20">
      <rect x="2" y="2" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 20 20">
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M4 6h12M4 10h12M4 14h8" />
    </svg>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 20 20">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 20 20">
      <rect x="2" y="3" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M6 1v4M14 1v4M2 8h16" />
      <circle cx="7" cy="13" r="1" fill="currentColor" />
      <circle cx="13" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

const statusItems: { value: TaskStatus | 'all'; label: string; color?: string }[] = [
  { value: 'all',         label: 'All Tasks' },
  { value: 'todo',         label: 'To Do',       color: 'bg-blue-500' },
  { value: 'in_progress',  label: 'In Progress',  color: 'bg-amber-500' },
  { value: 'done',         label: 'Done',         color: 'bg-emerald-500' },
];

const priorityItems: { value: TaskPriority | 'all'; label: string; color?: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high',     label: 'High',     color: 'bg-orange-500' },
  { value: 'medium',   label: 'Medium',   color: 'bg-yellow-500' },
  { value: 'low',      label: 'Low',      color: 'bg-green-500' },
];

export default function Sidebar({
  view,
  onViewChange,
  filterStatus,
  onFilterStatus,
  filterPriority,
  onFilterPriority,
  taskCounts,
}: SidebarProps) {
  return (
    <aside className="w-52 shrink-0 flex flex-col bg-zinc-950 border-r border-zinc-800/80 overflow-y-auto">
      {/* Views */}
      <section className="px-3 pt-5 pb-4">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-2">
          Views
        </p>
        <nav className="space-y-0.5">
          {(
            [
              { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: <DashboardIcon active={view === 'dashboard'} /> },
              { id: 'board'     as ViewMode, label: 'Board',     icon: <BoardIcon     active={view === 'board'}     /> },
              { id: 'list'      as ViewMode, label: 'List',      icon: <ListIcon      active={view === 'list'}      /> },
              { id: 'calendar'  as ViewMode, label: 'Calendar',  icon: <CalendarIcon  active={view === 'calendar'}  /> },
            ] as const
          ).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === id
                  ? 'bg-amber-600/15 text-amber-300'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </section>

      {(view === 'board' || view === 'list') && <div className="h-px bg-zinc-800/80 mx-3" />}

      {/* Status */}
      {(view === 'board' || view === 'list') && <section className="px-3 pt-4 pb-4">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-2">
          Status
        </p>
        <ul className="space-y-0.5">
          {statusItems.map((item) => {
            const active = filterStatus === item.value;
            return (
              <li key={item.value}>
                <button
                  onClick={() => onFilterStatus(item.value)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.color
                      ? <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      : <span className="w-2 h-2 rounded-full border border-zinc-600" />
                    }
                    {item.label}
                  </span>
                  <span className={`text-xs tabular-nums ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {taskCounts[item.value]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>}

      {(view === 'board' || view === 'list') && <div className="h-px bg-zinc-800/80 mx-3" />}

      {/* Priority */}
      {(view === 'board' || view === 'list') && <section className="px-3 pt-4 pb-4">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-2">
          Priority
        </p>
        <ul className="space-y-0.5">
          {priorityItems.map((item) => {
            const active = filterPriority === item.value;
            return (
              <li key={item.value}>
                <button
                  onClick={() => onFilterPriority(item.value)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {item.color
                    ? <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    : <span className="w-2 h-2 rounded-full border border-zinc-600" />
                  }
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>}

      {/* Footer */}
      <div className="mt-auto px-5 py-4 border-t border-zinc-800/80">
        <p className="text-xs text-zinc-700 leading-relaxed">Powered by Claude AI</p>
      </div>
    </aside>
  );
}
