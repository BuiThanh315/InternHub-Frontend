import React from 'react';
import type { ProgramStatusType } from '../../../../types';

interface ProgramStatusBadgeProps {
  status: ProgramStatusType;
}

export const ProgramStatusBadge: React.FC<ProgramStatusBadgeProps> = ({ status }) => {
  const configs: Record<ProgramStatusType, { label: string; bg: string; text: string; border: string }> = {
    PLANNING: {
      label: 'Lên kế hoạch',
      bg: 'rgba(100, 116, 139, 0.15)',
      text: '#94a3b8',
      border: 'rgba(148, 163, 184, 0.3)',
    },
    OPEN: {
      label: 'Mở nhận hồ sơ',
      bg: 'rgba(16, 185, 129, 0.15)',
      text: '#34d399',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    ONGOING: {
      label: 'Đang diễn ra',
      bg: 'rgba(59, 130, 246, 0.15)',
      text: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    COMPLETED: {
      label: 'Đã hoàn thành',
      bg: 'rgba(139, 92, 246, 0.15)',
      text: '#a78bfa',
      border: 'rgba(139, 92, 246, 0.3)',
    },
    CANCELLED: {
      label: 'Đã hủy',
      bg: 'rgba(239, 68, 68, 0.15)',
      text: '#f87171',
      border: 'rgba(239, 68, 68, 0.3)',
    },
  };

  const current = configs[status] || configs.PLANNING;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.text,
        }}
      />
      {current.label}
    </span>
  );
};
