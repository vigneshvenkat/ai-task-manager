'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

type PageItem = number | 'left-ellipsis' | 'right-ellipsis';

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: PageItem[] = [1];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2)         items.push('left-ellipsis');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push('right-ellipsis');
  items.push(total);

  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= pageSizeOptions[0]) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);
  const items = getPageItems(currentPage, totalPages);

  const btnBase = 'min-w-[30px] h-[30px] flex items-center justify-center rounded-lg text-xs font-medium transition-colors';
  const btnInactive = `${btnBase} text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800`;
  const btnActive   = `${btnBase} bg-amber-600 text-white`;
  const btnDisabled = `${btnBase} text-zinc-700 cursor-not-allowed`;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
      {/* Showing X–Y of Z */}
      <p className="text-xs text-zinc-500 tabular-nums shrink-0">
        Showing <span className="text-zinc-300 font-medium">{start}–{end}</span> of{' '}
        <span className="text-zinc-300 font-medium">{totalItems}</span>
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? btnDisabled : btnInactive}
          aria-label="Previous page"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {items.map((item, i) =>
          item === 'left-ellipsis' || item === 'right-ellipsis' ? (
            <span key={item + i} className="min-w-[30px] h-[30px] flex items-center justify-center text-xs text-zinc-600">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={item === currentPage ? btnActive : btnInactive}
            >
              {item}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? btnDisabled : btnInactive}
          aria-label="Next page"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Per-page selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-600">Per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-[30px] bg-zinc-800 border border-zinc-700 rounded-lg px-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:border-amber-500/50 focus:ring-amber-500/30 transition-colors cursor-pointer"
          >
            {pageSizeOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
