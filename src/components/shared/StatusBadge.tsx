import React from 'react';
import {
  statusConfig,
  mapBackendStatusToKey,
  type NormalizedStatusKey,
} from '../../features/interns/schema';
import type { InternStatus } from '../../types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: InternStatus | NormalizedStatusKey | string;
  className?: string;
  showDot?: boolean;
}

/**
 * StatusBadge - Standard Badge Component according to docs/spec.md section 6
 * - Always includes a dot indicator + label (for accessibility)
 * - Traversed strictly from centralized statusConfig
 * - Prohibits arbitrary hardcoded classes
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showDot = true,
}) => {
  const key =
    status in statusConfig
      ? (status as NormalizedStatusKey)
      : mapBackendStatusToKey(status);

  const meta = statusConfig[key] || statusConfig.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none',
        className
      )}
      style={{
        backgroundColor: meta.bgVar,
        color: meta.colorVar,
        border: `1px solid ${meta.borderVar}`,
      }}
      title={meta.description}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: meta.colorVar }}
          aria-hidden="true"
        />
      )}
      <span>{meta.label}</span>
    </span>
  );
};
