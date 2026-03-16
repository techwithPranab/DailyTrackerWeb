'use client';

/**
 * Reusable pagination bar.
 *
 * Props:
 *   currentPage  – 1-based current page number
 *   totalPages   – total number of pages
 *   totalItems   – total item count (for "Showing X–Y of Z" label)
 *   pageSize     – items per page
 *   onPageChange – (newPage: number) => void
 */
export default function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);

  // Build page list with ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - currentPage) <= 1
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
      {/* Summary */}
      <p className="text-xs text-gray-500 order-2 sm:order-1">
        Showing <span className="font-semibold text-gray-700">{start}–{end}</span> of{' '}
        <span className="font-semibold text-gray-700">{totalItems}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          title="First page"
        >«</button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >‹ Prev</button>

        {/* Page pills */}
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                p === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >{p}</button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >Next ›</button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          title="Last page"
        >»</button>
      </div>
    </div>
  );
}
