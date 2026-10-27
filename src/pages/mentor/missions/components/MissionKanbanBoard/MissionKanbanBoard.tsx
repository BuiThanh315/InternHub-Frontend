import React from 'react';
import { MissionKanbanColumn } from '../MissionKanbanColumn';
import type { MissionKanbanBoardProps } from './MissionKanbanBoard.types';
import styles from './MissionKanbanBoard.module.css';

export const MissionKanbanBoard: React.FC<MissionKanbanBoardProps> = ({
  todoItems,
  inProgressItems,
  completedItems,
  presenceMap,
  onAddNewItem,
  onEditItem,
  onDeleteItem,
  onStatusChange,
  onDropItem,
  onQuickAdd,
  onViewQuizDetail,
  className = '',
}) => {
  return (
    <div className={`${styles.boardContainer} ${className}`}>
      {/* Cột 1: Chưa làm (TODO) */}
      <MissionKanbanColumn
        status="TODO"
        title="Chưa làm"
        items={todoItems}
        presenceMap={presenceMap}
        onAddNewItem={() => onAddNewItem('TODO')}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
        onStatusChange={onStatusChange}
        onDropItem={onDropItem}
        onQuickAdd={onQuickAdd}
        onViewQuizDetail={onViewQuizDetail}
      />

      {/* Cột 2: Đang làm (IN_PROGRESS) */}
      <MissionKanbanColumn
        status="IN_PROGRESS"
        title="Đang làm"
        items={inProgressItems}
        presenceMap={presenceMap}
        onAddNewItem={() => onAddNewItem('IN_PROGRESS')}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
        onStatusChange={onStatusChange}
        onDropItem={onDropItem}
        onViewQuizDetail={onViewQuizDetail}
      />

      {/* Cột 3: Hoàn thiện (COMPLETED) */}
      <MissionKanbanColumn
        status="COMPLETED"
        title="Hoàn thiện"
        items={completedItems}
        presenceMap={presenceMap}
        onAddNewItem={() => onAddNewItem('COMPLETED')}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
        onStatusChange={onStatusChange}
        onDropItem={onDropItem}
        onViewQuizDetail={onViewQuizDetail}
      />
    </div>
  );
};

export default MissionKanbanBoard;
