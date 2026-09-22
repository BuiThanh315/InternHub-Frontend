import React from 'react';
import type { NormalizedStatusKey } from '../schema';
import { cn } from '../../../lib/utils';

interface QuickFilterProps {
  currentStatus: string;
  onSelectStatus: (status: string) => void;
  counts?: Record<string, number>;
}

/**
 * FilterBar - Quick Filter chips according to docs/spec.md section 5.1:
 * - Always visible in the filter bar, 1-click status switcher
 * - (Tất cả / Đang thực tập / Chờ duyệt / Hoàn thành / Từ chối)
 */
export const FilterBar: React.FC<QuickFilterProps> = ({
  currentStatus,
  onSelectStatus,
  counts,
}) => {
  const chips: { key: string; label: string; statusKey?: NormalizedStatusKey }[] = [
    { key: '', label: 'Tất cả' },
    { key: 'INTERNING', label: 'Đang thực tập', statusKey: 'active' },
    { key: 'PENDING', label: 'Chờ duyệt', statusKey: 'pending' },
    { key: 'COMPLETED', label: 'Hoàn thành', statusKey: 'completed' },
    { key: 'REJECTED', label: 'Từ chối', statusKey: 'rejected' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
      {chips.map((chip) => {
        const isSelected = currentStatus === chip.key;
        const count = counts && counts[chip.key] !== undefined ? counts[chip.key] : null;

        return (
          <button
            key={chip.key}
            onClick={() => onSelectStatus(chip.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border',
              isSelected
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface text-text-2 border-border hover:bg-surface-2 hover:text-text-1'
            )}
          >
            <span>{chip.label}</span>
            {count !== null && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  isSelected ? 'bg-white/20 text-white' : 'bg-border-soft text-text-2'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
