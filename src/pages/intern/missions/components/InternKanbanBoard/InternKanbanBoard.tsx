import React from 'react';
import { InternKanbanColumn } from '../InternKanbanColumn';
import type { InternKanbanBoardProps } from './InternKanbanBoard.types';
import styles from './InternKanbanBoard.module.css';

export const InternKanbanBoard: React.FC<InternKanbanBoardProps> = ({
  todoItems,
  inProgressItems,
  completedItems,
  onViewDetail,
  onStatusChange,
  onOpenSubmissionModal,
  isMutating = false,
  className = '',
}) => {
  return (
    <div className={`${styles.boardContainer} ${className}`}>
      {/* Cột 1: Chưa làm (TODO) */}
      <InternKanbanColumn
        status="TODO"
        title="Chưa làm"
        items={todoItems}
        onViewDetail={onViewDetail}
        onStatusChange={onStatusChange}
        onOpenSubmissionModal={onOpenSubmissionModal}
        isMutating={isMutating}
      />

      {/* Cột 2: Đang làm (IN_PROGRESS) */}
      <InternKanbanColumn
        status="IN_PROGRESS"
        title="Đang làm"
        items={inProgressItems}
        onViewDetail={onViewDetail}
        onStatusChange={onStatusChange}
        onOpenSubmissionModal={onOpenSubmissionModal}
        isMutating={isMutating}
      />

      {/* Cột 3: Hoàn thiện (COMPLETED) */}
      <InternKanbanColumn
        status="COMPLETED"
        title="Hoàn thiện"
        items={completedItems}
        onViewDetail={onViewDetail}
        onStatusChange={onStatusChange}
        onOpenSubmissionModal={onOpenSubmissionModal}
        isMutating={isMutating}
      />
    </div>
  );
};

export default InternKanbanBoard;
