import React, { useState } from 'react';
import {
  ArrowLeft,
  Kanban,
  Users,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Calendar,
  ClipboardCheck,
} from 'lucide-react';
import { Button, SearchBar, Select, Skeleton } from '../../../../../components/common';
import { formatDate } from '../../../../../utils/formatters';
import { MissionKanbanBoard } from '../MissionKanbanBoard';
import { MentorInternsAndGroupsTab, MentorAnalyticsTab, MentorWeeklyReportsTab } from './tabs';
import type { MentorProgramWorkspaceProps, WorkspaceTabKey } from './MentorProgramWorkspace.types';
import styles from './MentorProgramWorkspace.module.css';

export const MentorProgramWorkspace: React.FC<MentorProgramWorkspaceProps> = ({
  program,
  onBackToHub,
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
  todoItems,
  inProgressItems,
  completedItems,
  onCreateItem,
  onEditItem,
  onDeleteItem,
  onStatusChange,
  onDropItem,
  onQuickAdd,
  searchQuery,
  onSearchChange,
  selectedAssigneeId,
  onSelectAssignee,
  selectedPriority,
  onSelectPriority,
  programInterns,
  groups,
  internWorkloadMap,
  onOpenGroupModal,
  onAssignTaskToIntern,
  completionPercentage,
  isLoadingBoard,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>('kanban');

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  // Assignee options
  const assigneeOptions = [
    { value: '', label: 'Tất cả thực tập sinh' },
    ...programInterns.map((i) => ({
      value: String(i.id),
      label: `${i.fullName} (${i.internCode})`,
    })),
  ];

  // Priority options
  const priorityOptions = [
    { value: '', label: 'Tất cả độ ưu tiên' },
    { value: 'HIGH', label: 'Ưu tiên cao' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'LOW', label: 'Thấp' },
  ];

  // Render tab Kanban
  const renderKanbanTab = () => {
    if (isLoadingBoard) {
      return (
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonColumn}>
            <Skeleton height="28px" width="50%" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton height="28px" width="50%" />
            <Skeleton height="90px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton height="28px" width="50%" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
          </div>
        </div>
      );
    }

    if (boards.length === 0) {
      return (
        <div className={styles.emptyBoardCard}>
          <div className={styles.emptyIconWrapper}>
            <Kanban size={28} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa Có Bảng Nhiệm Vụ Nào</h3>
          <p className={styles.emptyDescription}>
            Chương trình thực tập này hiện chưa có tuần hay bảng nhiệm vụ nào được thiết lập. Hãy tạo bảng đầu tiên để bắt đầu giao việc cho các bạn.
          </p>
          <Button variant="primary" onClick={onCreateBoard}>
            <Plus size={16} /> Tạo Bảng Nhiệm Vụ Đầu Tiên
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* Horizontal Pills Chọn Board/Tuần */}
        <div className={styles.boardPillsContainer}>
          <div className={styles.pillsScrollList}>
            {boards.map((b) => {
              const isActive = b.id === activeBoardId;
              const total = b.totalItems || 0;
              const completed = b.completedCount || 0;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={b.id}
                  className={`${styles.boardPill} ${isActive ? styles.boardPillActive : ''}`}
                >
                  <button
                    type="button"
                    className={styles.boardPillBtn}
                    onClick={() => onSelectBoard(b.id)}
                  >
                    <span>{b.title}</span>
                    {total > 0 && <span style={{ opacity: 0.85 }}>({percent}%)</span>}
                  </button>

                  {isActive && (
                    <div className={styles.boardPillActions}>
                      <button
                        type="button"
                        className={styles.pillIconButton}
                        onClick={onEditBoard}
                        title="Chỉnh sửa tuần này"
                        aria-label="Chỉnh sửa tuần"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        className={styles.pillIconButton}
                        onClick={onDeleteBoard}
                        title="Xóa tuần này"
                        aria-label="Xóa tuần"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              className={styles.addBoardPillBtn}
              onClick={onCreateBoard}
              title="Thêm tuần/bảng nhiệm vụ mới"
            >
              <Plus size={14} /> Thêm Tuần Mới
            </button>
          </div>
        </div>

        {/* Toolbar Lọc Task */}
        {activeBoard && (
          <div className={styles.kanbanToolbar}>
            <div className={styles.searchBox}>
              <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Tìm công việc theo tiêu đề..."
              />
            </div>

            <div className={styles.filterControls}>
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
                    onSelectPriority(e.target.value ? (e.target.value as any) : null)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board 3 Cột */}
        <MissionKanbanBoard
          todoItems={todoItems}
          inProgressItems={inProgressItems}
          completedItems={completedItems}
          onAddNewItem={() => onCreateItem()}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onStatusChange={onStatusChange}
          onDropItem={onDropItem}
          onQuickAdd={onQuickAdd}
        />
      </>
    );
  };

  return (
    <div className={`${styles.workspaceContainer} ${className}`}>
      {/* Header Workspace */}
      <div className={styles.workspaceHeaderCard}>
        <div className={styles.topBreadcrumbRow}>
          <button type="button" className={styles.backButton} onClick={onBackToHub}>
            <ArrowLeft size={16} /> Quay lại danh sách chương trình
          </button>

          <div className={styles.headerActionButtons}>
            <Button variant="outline" size="sm" onClick={onOpenGroupModal}>
              <Users size={14} /> Quản Lý Nhóm
            </Button>
            <Button variant="primary" size="sm" onClick={() => onCreateItem()} disabled={!activeBoardId}>
              <Plus size={15} /> Giao Việc Mới
            </Button>
          </div>
        </div>

        <div className={styles.programHeadingGroup}>
          <h2 className={styles.programTitle}>
            {program.name} ({program.programCode})
          </h2>
          <div className={styles.programMetaRow}>
            {program.departmentName && (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Building2 size={13} /> {program.departmentName}
                </span>
                <span className={styles.metaDot}>•</span>
              </>
            )}
            <span>
              <Calendar size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {formatDate(program.startDate)} - {formatDate(program.endDate)}
            </span>
            <span className={styles.metaDot}>•</span>
            <span>{programInterns.length} Thực tập sinh</span>
            <span className={styles.metaDot}>•</span>
            <span>{groups.length} Nhóm dự án</span>
          </div>
        </div>

        {/* Segmented Control Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'kanban' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('kanban')}
          >
            <Kanban size={15} />
            <span>Bảng Nhiệm Vụ (Kanban)</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'interns' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('interns')}
          >
            <Users size={15} />
            <span>Đội Ngũ TTS & Chia Nhóm</span>
            <span className={styles.tabCountPill}>{programInterns.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <ClipboardCheck size={15} />
            <span>Kiểm Tra Báo Cáo Tuần</span>
            <span className={styles.tabCountPill}>{programInterns.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={15} />
            <span>Tổng Quan Tiến Độ</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'kanban' && renderKanbanTab()}

      {activeTab === 'interns' && (
        <MentorInternsAndGroupsTab
          programId={program.programId ?? program.id ?? 0}
          programName={program.name}
          programInterns={programInterns}
          groups={groups}
          internWorkloadMap={internWorkloadMap}
          onOpenGroupModal={onOpenGroupModal}
          onAssignTaskToIntern={onAssignTaskToIntern}
        />
      )}

      {activeTab === 'reviews' && (
        <MentorWeeklyReportsTab
          program={program}
          programInterns={programInterns}
          groups={groups}
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={onSelectBoard}
          internWorkloadMap={internWorkloadMap}
        />
      )}

      {activeTab === 'analytics' && (
        <MentorAnalyticsTab
          boards={boards}
          activeBoardId={activeBoardId}
          completionPercentage={completionPercentage}
          totalTasks={todoItems.length + inProgressItems.length + completedItems.length}
          completedTasks={completedItems.length}
        />
      )}
    </div>
  );
};

export default MentorProgramWorkspace;
