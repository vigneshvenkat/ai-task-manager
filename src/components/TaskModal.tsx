'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStatus, TaskPriority, CreateTaskInput, AISuggestion } from '@/types';

interface TaskModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  initialStatus?: TaskStatus;
  onSave: (input: CreateTaskInput) => Promise<void>;
  onClose: () => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string;
}

const defaultForm: FormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  dueDate: '',
  tags: '',
};

export default function TaskModal({ mode, task, initialStatus, onSave, onClose }: TaskModalProps) {
  const [form, setForm] = useState<FormState>({ ...defaultForm, status: initialStatus ?? 'todo' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        assignee: task.assignee ?? '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags.join(', '),
      });
    }
  }, [task]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    else if (form.title.length > 200) newErrors.title = 'Max 200 characters';
    if (form.description.length > 2000) newErrors.description = 'Max 2000 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        priority: form.priority,
        assignee: form.assignee.trim() || undefined,
        dueDate: form.dueDate || undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAISuggest = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setSuggestion(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json() as { suggestion?: AISuggestion; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'AI request failed');
      setSuggestion(data.suggestion ?? null);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI service unavailable');
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt]);

  const applyField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const applyAllSuggestions = () => {
    if (!suggestion) return;
    setForm((prev) => ({
      ...prev,
      ...(suggestion.title && { title: suggestion.title }),
      ...(suggestion.description && { description: suggestion.description }),
      ...(suggestion.priority && { priority: suggestion.priority }),
      ...(suggestion.tags && { tags: suggestion.tags.join(', ') }),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-y-auto sm:overflow-hidden sm:divide-x divide-zinc-800">
          {/* Left: Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 sm:flex-1 sm:overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => applyField('title', e.target.value)}
                placeholder="Enter task title..."
                className={`w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-colors ${
                  errors.title ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:border-amber-500/50 focus:ring-amber-500/30'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => applyField('description', e.target.value)}
                placeholder="Add more context, acceptance criteria, or notes..."
                rows={4}
                className={`w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-colors resize-none ${
                  errors.description ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:border-amber-500/50 focus:ring-amber-500/30'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => applyField('status', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:border-amber-500/50 focus:ring-amber-500/30 transition-colors"
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => applyField('priority', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:border-amber-500/50 focus:ring-amber-500/30 transition-colors"
                >
                  {priorityOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Assignee</label>
                <input
                  type="text"
                  value={form.assignee}
                  onChange={(e) => applyField('assignee', e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:border-amber-500/50 focus:ring-amber-500/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => applyField('dueDate', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:border-amber-500/50 focus:ring-amber-500/30 transition-colors"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => applyField('tags', e.target.value)}
                placeholder="backend, auth, bug (comma-separated)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:border-amber-500/50 focus:ring-amber-500/30 transition-colors"
              />
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:text-amber-400 text-white rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : mode === 'create' ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Right: AI Panel */}
          <div className="w-full sm:w-80 shrink-0 flex flex-col sm:overflow-y-auto p-5 space-y-4 bg-zinc-950/50 border-t sm:border-t-0 border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center text-xs">✦</div>
              <span className="text-sm font-medium text-zinc-300">AI Assistant</span>
            </div>
            <p className="text-xs text-zinc-500">
              Describe what you need and the AI will suggest a title, description, priority, and tags.
            </p>

            {/* Prompt input */}
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleAISuggest(); }}
              placeholder="e.g. Set up CI/CD pipeline for the staging environment using GitHub Actions..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:border-amber-500/50 focus:ring-amber-500/30 resize-none transition-colors"
            />

            <button
              onClick={handleAISuggest}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full py-2 text-sm font-medium bg-amber-600/20 hover:bg-amber-600/30 disabled:bg-zinc-800 text-amber-400 disabled:text-zinc-600 border border-amber-500/30 disabled:border-zinc-700 rounded-lg transition-colors"
            >
              {aiLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border border-amber-400/50 border-t-amber-400 rounded-full animate-spin" />
                  Generating…
                </span>
              ) : 'Get Suggestions ⌘↵'}
            </button>

            {aiError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                {aiError}
              </p>
            )}

            {/* Suggestions */}
            {suggestion && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Suggestions</span>
                  <button
                    onClick={applyAllSuggestions}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Apply all
                  </button>
                </div>

                {suggestion.title && (
                  <SuggestionItem
                    label="Title"
                    value={suggestion.title}
                    onApply={() => applyField('title', suggestion.title!)}
                  />
                )}

                {suggestion.description && (
                  <SuggestionItem
                    label="Description"
                    value={suggestion.description}
                    onApply={() => applyField('description', suggestion.description!)}
                  />
                )}

                {suggestion.priority && (
                  <SuggestionItem
                    label="Priority"
                    value={suggestion.priority}
                    onApply={() => applyField('priority', suggestion.priority!)}
                  />
                )}

                {suggestion.tags && suggestion.tags.length > 0 && (
                  <SuggestionItem
                    label="Tags"
                    value={suggestion.tags.join(', ')}
                    onApply={() => applyField('tags', suggestion.tags!.join(', '))}
                  />
                )}

                {suggestion.breakdown && suggestion.breakdown.length > 0 && (
                  <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-medium text-zinc-400">Breakdown</p>
                    <ul className="space-y-1">
                      {suggestion.breakdown.map((step, i) => (
                        <li key={i} className="text-xs text-zinc-400 flex gap-2">
                          <span className="text-amber-500 shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionItem({ label, value, onApply }: { label: string; value: string; onApply: () => void }) {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <button
          onClick={onApply}
          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          Apply →
        </button>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">{value}</p>
    </div>
  );
}
