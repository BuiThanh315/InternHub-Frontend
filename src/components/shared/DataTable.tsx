import React from 'react';
import { AlertCircle, FolderOpen, SearchX, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  isFiltered?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClearFilter?: () => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  keyExtractor: (row: T, index: number) => string | number;
  // Mobile Card Renderer (docs/spec.md section 4.5)
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
}

/**
 * DataTable - Table-First Component strictly adhering to docs/spec.md section 4.4 & 4.5:
 * 5 MANDATORY STATES:
 * 1. loading (Skeleton row, no full-page spinner)
 * 2. error (Inline banner with Retry button)
 * 3. empty (Clean system empty state + CTA)
 * 4. filtered_empty (Clear distinction from native empty + Clear Filter button)
 * 5. data (Desktop: Density-first rows 44-48px; Mobile: Card List layout)
 */
export function DataTable<T>({
  columns,
  data,
  loading = false,
  isFiltered = false,
  error = null,
  onRetry,
  onClearFilter,
  onRowClick,
  emptyTitle = 'Chưa có dữ liệu nào',
  emptyDescription = 'Hệ thống hiện tại chưa ghi nhận dữ liệu trong mục này.',
  emptyAction,
  keyExtractor,
  renderMobileCard,
}: DataTableProps<T>) {
  // STATE 1: ERROR
  if (error) {
    return (
      <div className="rounded-[12px] border border-[var(--danger-soft)] bg-[var(--danger-soft)]/40 p-8 text-center my-4">
        <AlertCircle className="w-10 h-10 text-[var(--danger)] mx-auto mb-3" />
        <h4 className="text-base font-bold text-[var(--text-1)]">Không thể tải dữ liệu</h4>
        <p className="text-sm text-[var(--text-2)] mt-1 max-w-md mx-auto">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--surface)] text-[var(--text-1)] border border-[var(--border)] hover:bg-[var(--surface-2)] shadow-sm transition-colors"
          >
            <RefreshCw size={14} /> Thử lại
          </button>
        )}
      </div>
    );
  }

  // SKELETON ROW GENERATOR (STATE 2: LOADING)
  if (loading) {
    return (
      <div className="w-full overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className="px-4 py-3 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} className="h-12 animate-pulse">
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-3">
                    <div className="h-4 bg-[var(--border)]/60 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // STATE 3: FILTERED EMPTY
  if (data.length === 0 && isFiltered) {
    return (
      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-card)]">
        <SearchX className="w-12 h-12 text-[var(--text-3)] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[var(--text-1)]">Không tìm thấy kết quả phù hợp</h3>
        <p className="text-sm text-[var(--text-2)] mt-1 max-w-sm mx-auto">
          Không có bản ghi nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
        </p>
        {onClearFilter && (
          <button
            onClick={onClearFilter}
            className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    );
  }

  // STATE 4: NATIVE EMPTY
  if (data.length === 0) {
    return (
      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-card)]">
        <FolderOpen className="w-12 h-12 text-[var(--primary)]/70 mx-auto mb-3" />
        <h3 className="text-base font-bold text-[var(--text-1)]">{emptyTitle}</h3>
        <p className="text-sm text-[var(--text-2)] mt-1 max-w-sm mx-auto">{emptyDescription}</p>
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </div>
    );
  }

  // STATE 5: HAS DATA
  return (
    <>
      {/* Mobile Card List (<768px) - docs/spec.md section 4.5 */}
      {renderMobileCard && (
        <div className="block md:hidden space-y-3">
          {data.map((row, index) => (
            <div
              key={keyExtractor(row, index)}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                'p-4 rounded-[12px] border border-border bg-surface shadow-card transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-2'
              )}
            >
              {renderMobileCard(row, index)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop & Tablet Table (≥768px or fallback if no mobile card renderer) */}
      <div
        className={cn(
          'w-full overflow-x-auto rounded-[12px] border border-border bg-surface shadow-card scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent',
          renderMobileCard ? 'hidden md:block' : 'block'
        )}
      >
        <table className="w-full text-left border-collapse min-w-full table-auto">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                  className={cn(
                    'px-3 py-3 text-[11px] font-bold text-text-2 uppercase tracking-wider select-none whitespace-nowrap bg-surface-2',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'h-12 transition-colors duration-150',
                  'hover:bg-surface-2/70',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                    className={cn('px-3 py-2 text-xs text-text-1 align-middle', col.className)}
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
