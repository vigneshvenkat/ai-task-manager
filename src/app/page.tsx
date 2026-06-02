'use client';

import { useMemo, useState } from 'react';
import type { Task, TaskPriority, TaskStatus, ViewMode, CreateTaskInput, TaskStats } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsBar from '@/components/StatsBar';
import TaskBoard from '@/components/TaskBoard';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
import Dashboard from '@/components/Dashboard';
import Calendar from '@/components/Calendar';

interface ModalState {
  open: boolean;
  mode: 'create' | 'edit';
  task?: Task;
  initialStatus?: TaskStatus;
}

export default function HomePage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, clearError } = useTasks();

  const [view, setView] = useState<ViewMode>('dashboard');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.tags.some((t) => t.toLowerCase().includes(q)) ||
          task.assignee?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, filterStatus, filterPriority, searchQuery]);

  // Stats computed from full task list
  const stats = useMemo<TaskStats>(() => {
    const now = new Date();
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter(
        (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now
      ).length,
    };
  }, [tasks]);

  // Sidebar task counts (filtered by search but not by status/priority for status counts)
  const taskCounts = useMemo<Record<TaskStatus | 'all', number>>(() => {
    const q = searchQuery.toLowerCase();
    const searched = q
      ? tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      : tasks;
    return {
      all:         searched.length,
      todo:        searched.filter((t) => t.status === 'todo').length,
      in_progress: searched.filter((t) => t.status === 'in_progress').length,
      done:        searched.filter((t) => t.status === 'done').length,
    };
  }, [tasks, searchQuery]);

  const openCreate = (initialStatus?: TaskStatus) =>
    setModal({ open: true, mode: 'create', initialStatus });
  const openEdit = (task: Task) => setModal({ open: true, mode: 'edit', task });
  const closeModal = () => setModal({ open: false, mode: 'create' });

  const handleSave = async (input: CreateTaskInput) => {
    if (modal.mode === 'create') {
      await createTask(input);
    } else if (modal.task) {
      await updateTask(modal.task._id, input);
    }
    closeModal();
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const handleQuickCreate = async (title: string, status: TaskStatus) => {
    await createTask({ title, status, priority: 'medium', tags: [] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <Header
        onNewTask={openCreate}
        onSearch={setSearchQuery}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          view={view}
          onViewChange={(v) => { setView(v); setSidebarOpen(false); }}
          filterStatus={filterStatus}
          onFilterStatus={(s) => { setFilterStatus(s); setSidebarOpen(false); }}
          filterPriority={filterPriority}
          onFilterPriority={(p) => { setFilterPriority(p); setSidebarOpen(false); }}
          taskCounts={taskCounts}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Stats + controls */}
          <div className={`px-6 pt-5 pb-4 border-b border-zinc-800 space-y-4 ${view === 'dashboard' || view === 'calendar' ? 'hidden' : ''}`}>
            <StatsBar stats={stats} />

            {/* Active filters */}
            {(filterStatus !== 'all' || filterPriority !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-zinc-500">Filters:</span>
                {searchQuery && (
                  <FilterChip label={`"${searchQuery}"`} onRemove={() => setSearchQuery('')} />
                )}
                {filterStatus !== 'all' && (
                  <FilterChip label={filterStatus.replace('_', ' ')} onRemove={() => setFilterStatus('all')} />
                )}
                {filterPriority !== 'all' && (
                  <FilterChip label={filterPriority} onRemove={() => setFilterPriority('all')} />
                )}
                <button
                  onClick={() => { setFilterStatus('all'); setFilterPriority('all'); setSearchQuery(''); }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-4 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={clearError} className="text-red-400/60 hover:text-red-400 transition-colors text-sm">✕</button>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && tasks.length === 0 ? (
              <LoadingSkeleton />
            ) : (
              <>
                {view === 'board' && (
                  <TaskBoard
                    tasks={filteredTasks}
                    onEditTask={openEdit}
                    onDeleteTask={handleDelete}
                    onStatusChange={handleStatusChange}
                    onCreateTask={openCreate}
                    onQuickCreateTask={handleQuickCreate}
                  />
                )}
                {view === 'list' && (
                  <TaskList
                    tasks={filteredTasks}
                    onEditTask={openEdit}
                    onDeleteTask={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                )}
                {view === 'dashboard' && (
                  <Dashboard
                    tasks={tasks}
                    onEditTask={openEdit}
                  />
                )}
                {view === 'calendar' && (
                  <Calendar
                    tasks={tasks}
                    onEditTask={openEdit}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {modal.open && (
        <TaskModal
          mode={modal.mode}
          task={modal.task}
          initialStatus={modal.initialStatus}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5">
      {label}
      <button onClick={onRemove} className="hover:text-amber-100 transition-colors">✕</button>
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map((col) => (
        <div key={col} className="space-y-3">
          <div className="h-5 w-24 bg-zinc-800 rounded animate-pulse" />
          <div className="h-px bg-zinc-800" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2 animate-pulse">
              <div className="h-1.5 w-12 bg-zinc-800 rounded-full" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
              <div className="flex gap-1 pt-1">
                <div className="h-5 w-14 bg-zinc-800 rounded" />
                <div className="h-5 w-10 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
