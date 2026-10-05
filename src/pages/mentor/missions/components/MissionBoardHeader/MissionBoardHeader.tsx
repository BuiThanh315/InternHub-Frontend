import React from 'react';
import { Plus, Calendar, Edit2, Trash2, Kanban } from 'lucide-react';
import { Button, Select, SearchBar } from '../../../../../components/common';
import { formatDate } from '../../../../../utils/formatters';
import type { MissionBoardHeaderProps } from './MissionBoardHeader.types';
import styles from './MissionBoardHeader.module.css';

export const MissionBoardHeader: React.FC<MissionBoardHeaderProps> = ({
  programs,
  selectedProgramId,
  onSelectProgram,
  boards,
  activeBoardId,
  onSelectBoard,
  completionPercentage,
  totalItems,
  completedItems,
  searchQuery,
  onSearchChange,
  programInterns,
  selectedAssigneeId,
  onSelectAssignee,
  selectedPriority,
  onSelectPriority,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
  onCreateItem,
  className = '',
}) => {
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  // Options cho Program Select
  const programOptions = programs.map((p) => {
    const pId = p.programId ?? p.id;
    return {
      value: String(pId),
      label: `${p.name} (${p.programCode})`,
    };
  });

  // Options cho Board Select
  const boardOptions = boards.map((b) => ({
    value: String(b.id),
    label: b.title,
  }));

  // Options cho TTS Filter
  const assigneeOptions = [
    { value: '', label: 'Tất cả thực tập sinh' },
    ...programInterns.map((i) => ({
      value: String(i.id),
      label: `${i.fullName} (${i.internCode})`,
    })),
  ];

  // Options cho Priority Filter
  const priorityOptions = [
    { value: '', label: 'Tất cả độ ưu tiên' },
    { value: 'HIGH', label: 'Ưu tiên cao' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'LOW', label: 'Thấp' },
  ];

  return (
    <div className={`${styles.headerContainer} ${className}`}>
      {/* Hàng 1: Chọn Chương trình + Chọn Bảng + Nút Thao tác */}
      <div className={styles.topRow}>
        <div className={styles.selectorGroup}>
          <div className={styles.selectorItem}>
            <Select
              label="Chương trình thực tập"
              options={programOptions}
              value={selectedProgramId ? String(selectedProgramId) : ''}
              onChange={(e) => onSelectProgram(Number(e.target.value))}
              disabled={programs.length === 0}
            />
          </div>

          {boards.length > 0 && (
            <div className={styles.selectorItem}>
              <Select
                label="Bảng nhiệm vụ"
                options={boardOptions}
                value={activeBoardId ? String(activeBoardId) : ''}
                onChange={(e) => onSelectBoard(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            onClick={onCreateBoard}
            disabled={!selectedProgramId}
          >
            <Kanban size={15} /> Tạo Bảng Mới
          </Button>

          <Button
            variant="primary"
            onClick={onCreateItem}
            disabled={!activeBoardId}
          >
            <Plus size={16} /> Giao Việc Mới
          </Button>
        </div>
      </div>

      {/* Hàng 2: Tiến độ hoàn thành & Thao tác với Bảng hiện tại */}
      {activeBoard && (
        <div className={styles.progressRow}>
          <div className={styles.boardMeta}>
            <div className={styles.boardTitleGroup}>
              <h2 className={styles.boardTitle}>{activeBoard.title}</h2>
              <div className={styles.boardActions}>
                <button
                  type="button"
                  className={styles.boardIconButton}
                  onClick={onEditBoard}
                  title="Chỉnh sửa tên/mô tả bảng"
                  aria-label="Chỉnh sửa bảng"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  className={`${styles.boardIconButton} ${styles.boardIconButtonDanger}`}
                  onClick={onDeleteBoard}
                  title="Xóa bảng nhiệm vụ này"
                  aria-label="Xóa bảng"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {activeBoard.dueDate && (
              <span className={styles.boardDueDate}>
                <Calendar size={13} />
                Hạn chót: {formatDate(activeBoard.dueDate)}
              </span>
            )}
          </div>

          {/* Thanh Tiến độ tổng quan */}
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBarTrack} title={`Đã hoàn thành ${completionPercentage}%`}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {completedItems}/{totalItems} hoàn thành ({completionPercentage}%)
            </span>
          </div>
        </div>
      )}

      {/* Hàng 3: Toolbar Tìm kiếm & Lọc (Search & Filters) */}
      {activeBoard && (
        <div className={styles.filterToolbar}>
          <div className={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Tìm kiếm công việc theo tiêu đề..."
            />
          </div>

          <div className={styles.filtersGroup}>
            <div className={styles.filterSelect}>
              <Select
                options={assigneeOptions}
                value={selectedAssigneeId ? String(selectedAssigneeId) : ''}
                onChange={(e) =>
                  onSelectAssignee(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>

            <div className={styles.filterSelect}>
              <Select
                options={priorityOptions}
                value={selectedPriority || ''}
                onChange={(e) =>
                  onSelectPriority(
                    e.target.value ? (e.target.value as any) : null
                  )
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionBoardHeader;
