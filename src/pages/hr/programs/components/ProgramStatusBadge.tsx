import React from 'react';
import type { ProgramStatusType } from '../../../../types';

interface ProgramStatusBadgeProps {
  status: ProgramStatusType;
}

export const ProgramStatusBadge: React.FC<ProgramStatusBadgeProps> = ({ status }) => {
  const configs: Record<ProgramStatusType, { label: string; bg: string; text: string; border: string }> = {
    PLANNING: {
      label: 'Lên kế hoạch',
      bg: 'var(--border-subtle)',
      text: 'var(--text-muted)',
      border: 'var(--border-default)',
    },
    OPEN: {
      label: 'Mở nhận hồ sơ',
      bg: 'var(--success-bg)',
      text: 'var(--success)',
      border: 'var(--success-border)',
    },
    ONGOING: {
      label: 'Đang diễn ra',
      bg: 'var(--info-bg)',
      text: 'var(--info)',
      border: 'var(--info-border)',
    },
    COMPLETED: {
      label: 'Đã hoàn thành',
      bg: 'var(--primary-light)',
      text: 'var(--primary)',
      border: 'var(--border-focus)',
    },
    CANCELLED: {
      label: 'Đã hủy',
      bg: 'var(--danger-bg)',
      text: 'var(--danger)',
      border: 'var(--danger-border)',
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
