import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  changeRate?: string;
  accentColor?: string;
  onClick?: () => void;
  active?: boolean;
}

/**
 * KpiCard - KPI Summary metric card according to docs/spec.md section 3.1 & 1.2
 * Uses Manrope font for large numerical display, click-through capable
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  changeRate,
  accentColor = 'var(--primary)',
  onClick,
  active = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-[12px] transition-all duration-200 cursor-pointer border',
        'bg-surface hover:bg-surface-2 shadow-card',
        active ? 'border-primary ring-2 ring-primary-soft' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-text-2 uppercase tracking-wider">
            {title}
          </span>
          <div
            className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-text-1 font-heading"
          >
            {value}
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-105"
          style={{
            backgroundColor: 'var(--primary-soft)',
            color: accentColor,
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      {(subtitle || changeRate) && (
        <div className="mt-3 flex items-center justify-between text-xs text-text-3 border-t border-border-soft pt-2.5">
          <span>{subtitle}</span>
          {changeRate && (
            <span className="inline-flex items-center text-success font-medium">
              {changeRate}
              <ArrowUpRight size={13} className="ml-0.5" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
