'use client';

import { useState } from 'react';

interface HeaderProps {
  onNewTask: () => void;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Header({ onNewTask, onSearch, onRefresh, loading }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 bg-zinc-950 border-b border-zinc-800/80">
      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0 mr-1">
        <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/40">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="13" cy="12" r="2.5" fill="white" />
          </svg>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-zinc-100 leading-none">TaskFlow</p>
          <p className="text-xs text-zinc-600 leading-none mt-0.5">AI-powered</p>
        </div>
      </div>

      <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search tasks…"
          className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-8 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
        />
        {searchValue && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.07 15.93A8 8 0 1 1 20 12" />
          </svg>
        </button>

        <button
          onClick={() => onNewTask()}
          className="flex items-center gap-1.5 h-8 px-3.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-amber-900/30"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </header>
  );
}
