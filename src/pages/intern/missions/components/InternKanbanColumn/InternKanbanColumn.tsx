import React from 'react';
import { Circle, PlayCircle, CheckCircle2 } from 'lucide-react';

import { InternTaskCard } from '../InternTaskCard';
import type { InternKanbanColumnProps } from './InternKanbanColumn.types';
import styles from './InternKanbanColumn.module.css';

export const InternKanbanColumn: React.FC<InternKanbanColumnProps> = ({
  status,
  title,
  items,
  onViewDetail,
  onStatusChange,
  onOpenSubmissionModal,
  isMutating = false,
  className = '',
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'TODO':
        return <Circle size={16} className={styles.columnIconTodo} />;
      case 'IN_PROGRESS':
        return <PlayCircle size={16} className={styles.columnIconInProgress} />;
      case 'COMPLETED':
        return <CheckCircle2 size={16} className={styles.columnIconCompleted} />;
    }
  };

  return (
    <div className={`${styles.column} ${className}`}>
      {/* Column Header */}
      <div className={styles.columnHeader}>
        <div className={styles.headerLeft}>
          {getStatusIcon()}
          <h3 className={styles.columnTitle}>{title}</h3>
          <span className={styles.countBadge}>{items.length}</span>
        </div>
      </div>

      {/* Card List */}
      <div className={styles.cardList}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Chưa có công việc nào trong cột này</p>
          </div>
        ) : (
          items.map((item) => (
            <InternTaskCard
              key={item.id}
              item={item}
              onViewDetail={onViewDetail}
              onStatusChange={onStatusChange}
              onOpenSubmissionModal={onOpenSubmissionModal}
              isMutating={isMutating}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default InternKanbanColumn;
