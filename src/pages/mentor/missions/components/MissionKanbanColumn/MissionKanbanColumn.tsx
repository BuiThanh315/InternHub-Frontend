import React from 'react';
import { Circle, PlayCircle, CheckCircle2, Plus } from 'lucide-react';
import { MissionCard } from '../MissionCard';
import type { MissionKanbanColumnProps } from './MissionKanbanColumn.types';
import styles from './MissionKanbanColumn.module.css';

export const MissionKanbanColumn: React.FC<MissionKanbanColumnProps> = ({
  status,
  title,
  items,
  onAddNewItem,
  onEditItem,
  onDeleteItem,
  onStatusChange,
  className = '',
}) => {
  // Icon & màu sắc nhận diện cột
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
      {/* Header cột */}
      <div className={styles.columnHeader}>
        <div className={styles.headerLeft}>
          {getStatusIcon()}
          <h3 className={styles.columnTitle}>{title}</h3>
          <span className={styles.countBadge}>{items.length}</span>
        </div>

        {onAddNewItem && (
          <button
            type="button"
            className={styles.addQuickButton}
            onClick={onAddNewItem}
            title={`Thêm công việc vào cột ${title}`}
            aria-label={`Thêm công việc vào cột ${title}`}
          >
            <Plus size={15} />
          </button>
        )}
      </div>

      {/* Body: Danh sách thẻ công việc */}
      <div className={styles.cardList}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Chưa có công việc nào</p>
            {onAddNewItem && (
              <button
                type="button"
                className={styles.emptyAddButton}
                onClick={onAddNewItem}
              >
                + Thêm công việc
              </button>
            )}
          </div>
        ) : (
          items.map((item) => (
            <MissionCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MissionKanbanColumn;
