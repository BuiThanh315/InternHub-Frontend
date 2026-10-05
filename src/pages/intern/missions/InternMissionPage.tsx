import React, { useState } from 'react';
import {
  Kanban,
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
  AlertCircle,
  FilterX,
  RefreshCw,
} from 'lucide-react';

import { Header } from '../../../components/layout/Header';
import {
  Button,
  Select,
  SearchBar,
  Skeleton,
  Alert,
  ErrorBoundary,
} from '../../../components/common';
import {
  InternKanbanBoard,
  TaskDetailModal,
  TaskSubmissionModal,
} from './components';

import { useInternKanban } from '../../../hooks/useInternKanban';

import type {
  MissionItemResponse,
  MissionItemStatus,
  MissionPriority,
} from '../../../types';
import styles from './InternMissionPage.module.css';

const InternMissionContent: React.FC = () => {
  const {
    totalCount,
    todoCount,
    inProgressCount,
    completedCount,
    todoItems,
    inProgressItems,
    completedItems,
    totalFilteredCount,
    filters,
    setSearchQuery,
    setSelectedPriority,
    setFilterOverdueOnly,
    resetFilters,
    isLoading,
    isMutating,
    error,
    refreshKanban,
    updateTaskStatus,
  } = useInternKanban();

  // Modals state (chỉ 2 state đơn giản - Rule 14)
  const [selectedDetailItem, setSelectedDetailItem] = useState<MissionItemResponse | null>(null);
  const [submissionModalItem, setSubmissionModalItem] = useState<MissionItemResponse | null>(null);

  // Xử lý chuyển đổi trạng thái trực tiếp (TODO <-> IN_PROGRESS, COMPLETED <-> IN_PROGRESS)
  const handleDirectStatusChange = async (itemId: number, newStatus: MissionItemStatus) => {
    await updateTaskStatus(itemId, newStatus);
  };

  // Xử lý mở Modal nộp sản phẩm khi hoàn thành nhiệm vụ
  const handleOpenSubmissionModal = (item: MissionItemResponse) => {
    setSubmissionModalItem(item);
  };

  // Xác nhận nộp bài và hoàn thành
  const handleConfirmSubmission = async (
    itemId: number,
    submissionUrl: string | null,
    completionNote: string | null
  ): Promise<boolean> => {
    return await updateTaskStatus(itemId, 'COMPLETED', submissionUrl, completionNote);
  };

  const priorityOptions = [
    { value: '', label: 'Tất cả độ ưu tiên' },
    { value: 'HIGH', label: 'Ưu tiên cao' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'LOW', label: 'Thấp' },
  ];

  const hasActiveFilters =
    Boolean(filters.searchQuery.trim()) ||
    Boolean(filters.selectedPriority) ||
    filters.filterOverdueOnly;

  return (
    <div className={styles.container}>
      {/* Lớp 1: Header Bar */}
      <Header
        title="Nhiệm Vụ Của Tôi (My Tasks & Missions)"
        subtitle="Quản lý và điều phối các đầu việc được Mentor giao trên bảng Kanban 3 nấc trạng thái"
      />

      {/* Lớp 2: Metrics Strip */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.metricIconTotal}`}>
            <Kanban size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng số nhiệm vụ</span>
            <span className={styles.metricValue}>{totalCount}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.metricIconTodo}`}>
            <Clock size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Chưa làm (TODO)</span>
            <span className={styles.metricValue}>{todoCount}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.metricIconInProgress}`}>
            <PlayCircle size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Đang làm (IN_PROGRESS)</span>
            <span className={styles.metricValue}>{inProgressCount}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.metricIconCompleted}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Đã hoàn thiện (COMPLETED)</span>
            <span className={styles.metricValue}>{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Lớp 2 (tiếp): Filter & Search Toolbar */}
      <div className={styles.filterBar}>
        <div className={styles.filterControls}>
          <div className={styles.searchBox}>
            <SearchBar
              placeholder="Tìm kiếm công việc, bảng nhiệm vụ..."
              value={filters.searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className={styles.prioritySelect}>
            <Select
              options={priorityOptions}
              value={filters.selectedPriority || ''}
              onChange={(e) =>
                setSelectedPriority((e.target.value as MissionPriority) || null)
              }
            />
          </div>

          <button
            type="button"
            className={`${styles.overdueToggle} ${
              filters.filterOverdueOnly ? styles.overdueActive : ''
            }`}
            onClick={() => setFilterOverdueOnly(!filters.filterOverdueOnly)}
            title="Lọc các nhiệm vụ đã quá hạn"
          >
            <AlertCircle size={15} />
            <span>Chỉ việc quá hạn</span>
          </button>
        </div>

        <div className={styles.actionButtons}>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              title="Đặt lại bộ lọc"
            >
              <FilterX size={15} />
              <span>Xóa bộ lọc</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refreshKanban}
            disabled={isLoading || isMutating}
            title="Làm mới dữ liệu từ máy chủ"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Lớp 3: Content Board & 5 UI States */}
      {error ? (
        <Alert type="error">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refreshKanban}>
              <RotateCcw size={14} /> Thử lại
            </Button>
          </div>
        </Alert>
      ) : isLoading ? (
        /* Trạng thái 1: Skeleton Loading (Rule 32) */
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonColumn}>
            <Skeleton variant="text" width="60%" height="24px" />
            <Skeleton variant="card" height="150px" />
            <Skeleton variant="card" height="150px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton variant="text" width="60%" height="24px" />
            <Skeleton variant="card" height="150px" />
          </div>
          <div className={styles.skeletonColumn}>
            <Skeleton variant="text" width="60%" height="24px" />
            <Skeleton variant="card" height="150px" />
            <Skeleton variant="card" height="150px" />
          </div>
        </div>
      ) : totalCount === 0 ? (
        /* Trạng thái 2a: Empty State (chưa có task nào được giao) */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconWrapper}>
            <Kanban size={36} />
          </div>
          <h3 className={styles.emptyTitle}>Bạn chưa có nhiệm vụ nào được giao</h3>
          <p className={styles.emptyDescription}>
            Người hướng dẫn (Mentor) sẽ phân công các mục công việc chi tiết cho bạn trong suốt
            quá trình thực tập. Hãy kiểm tra lại sau hoặc liên hệ với Mentor của bạn.
          </p>
        </div>
      ) : totalFilteredCount === 0 && hasActiveFilters ? (
        /* Trạng thái 2b: Empty Filter State (tìm kiếm không ra kết quả) */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconWrapper}>
            <FilterX size={36} />
          </div>
          <h3 className={styles.emptyTitle}>Không tìm thấy nhiệm vụ phù hợp</h3>
          <p className={styles.emptyDescription}>
            Không có công việc nào khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            <FilterX size={15} /> Xóa bộ lọc
          </Button>
        </div>
      ) : (
        /* Bảng Kanban 3 cột chính thức */
        <InternKanbanBoard
          todoItems={todoItems}
          inProgressItems={inProgressItems}
          completedItems={completedItems}
          onViewDetail={(item) => setSelectedDetailItem(item)}
          onStatusChange={handleDirectStatusChange}
          onOpenSubmissionModal={handleOpenSubmissionModal}
          isMutating={isMutating}
        />
      )}

      {/* Lớp 4: Modals (Modal-First UX) */}
      <TaskDetailModal
        isOpen={Boolean(selectedDetailItem)}
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onStartProgress={(item) => handleDirectStatusChange(item.id, 'IN_PROGRESS')}
        onOpenSubmission={(item) => handleOpenSubmissionModal(item)}
        onReopen={(item) => handleDirectStatusChange(item.id, 'IN_PROGRESS')}
      />

      <TaskSubmissionModal
        isOpen={Boolean(submissionModalItem)}
        item={submissionModalItem}
        onClose={() => setSubmissionModalItem(null)}
        onSubmit={handleConfirmSubmission}
        isSubmitting={isMutating}
      />
    </div>
  );
};

export const InternMissionPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <InternMissionContent />
    </ErrorBoundary>
  );
};

export default InternMissionPage;
