import React, { useState } from 'react';
import { Circle, PlayCircle, CheckCircle2, Plus, CornerDownLeft } from 'lucide-react';
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
  onDropItem,
  onQuickAdd,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const rawId = e.dataTransfer.getData('text/plain');
    const itemId = Number(rawId);
    if (itemId && onDropItem) {
      onDropItem(itemId, status);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !onQuickAdd || isSubmittingQuick) return;
    try {
      setIsSubmittingQuick(true);
      const success = await onQuickAdd(quickTitle.trim());
      if (success) {
        setQuickTitle('');
      }
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  return (
    <div
      className={`${styles.column} ${isDragOver ? styles.columnDragOver : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
            title={`Giao việc vào cột ${title}`}
            aria-label={`Giao việc vào cột ${title}`}
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
                + Giao việc vào cột này
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

      {/* Quick Add ở chân cột nhiệm vụ cần làm */}
      {status === 'TODO' && onQuickAdd && (
        <div className={styles.quickAddContainer}>
          <form onSubmit={handleQuickSubmit} className={styles.quickAddForm}>
            <input
              type="text"
              className={styles.quickAddInput}
              placeholder="+ Nhập tên việc rồi nhấn Enter để giao việc..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              disabled={isSubmittingQuick}
              title="Nhập tiêu đề công việc rồi nhấn Enter để phân công"
            />
            <button
              type="submit"
              className={styles.quickAddSubmitBtn}
              disabled={!quickTitle.trim() || isSubmittingQuick}
              title="Mở form phân công công việc"
            >
              <CornerDownLeft size={13} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MissionKanbanColumn;
