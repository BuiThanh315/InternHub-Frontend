import React from 'react';
import {
  Plus,
  RotateCw,
  Filter,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { ErrorBoundary, Button } from '../../../components/common';
import { useInternLeaveRequests } from './hooks/useInternLeaveRequests';
import {
  LeaveSummaryCards,
  LeaveRequestTable,
  CreateLeaveModal,
  LeaveDetailModal,
  CancelLeaveConfirmModal,
} from './components';
import type { LeaveStatus } from '../../../types';
import styles from './InternLeavePage.module.css';

const YEARS = [2024, 2025, 2026, 2027];

const STATUS_OPTIONS: { value?: LeaveStatus; label: string }[] = [
  { value: undefined, label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xét duyệt' },
  { value: 'APPROVED', label: 'Đã phê duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CANCELLED', label: 'Đã hủy bỏ' },
];

export const InternLeavePage: React.FC = () => {
  const {
    requests,
    totalElements,
    totalPages,
    loading,
    error,
    status,
    year,
    page,
    setStatus,
    setYear,
    setPage,
    resetFilters,
    isCreateOpen,
    detailId,
    cancellingItem,
    isSubmitting,
    openCreateModal,
    closeCreateModal,
    openDetailModal,
    closeDetailModal,
    openCancelModal,
    closeCancelModal,
    handleCreateLeave,
    handleCancelLeave,
    refetch,
  } = useInternLeaveRequests();

  return (
    <ErrorBoundary>
      <div className={styles.pageWrapper}>
        {/* Layer 1: Header Bar */}
        <div className={styles.headerBar}>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>Quản Lý Đơn Xin Nghỉ Phép</h1>
            <p className={styles.pageSubtitle}>
              Nộp đơn xin nghỉ phép có lý do chính đáng, theo dõi tiến trình phê duyệt
              của Mentor và lịch sử ngày nghỉ cá nhân.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              variant="outline"
              size="md"
              onClick={refetch}
              disabled={loading}
              title="Tải lại dữ liệu mới nhất"
            >
              <RotateCw size={15} style={{ marginRight: 6 }} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={openCreateModal}
            >
              <Plus size={16} style={{ marginRight: 6 }} />
              Tạo Đơn Xin Nghỉ Mới
            </Button>
          </div>
        </div>

        {/* Layer 2: 4 Thẻ KPI Tóm Tắt Nghỉ Phép */}
        <LeaveSummaryCards
          requests={requests}
          totalElements={totalElements}
          loading={loading}
        />

        {/* Layer 2: Filter Toolbar */}
        <div className={styles.filterCard}>
          <div className={styles.filterGroup}>
            {/* Lọc Trạng thái */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel} htmlFor="statusFilter">
                <Filter size={15} />
                <span>Trạng thái:</span>
              </label>
              <select
                id="statusFilter"
                className={styles.selectControl}
                value={status || ''}
                onChange={(e) => {
                  const val = e.target.value as LeaveStatus;
                  setStatus(val ? val : undefined);
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value || ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc Năm */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel} htmlFor="yearFilter">
                <Calendar size={15} />
                <span>Năm:</span>
              </label>
              <select
                id="yearFilter"
                className={styles.selectControl}
                value={year || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setYear(val ? Number(val) : undefined);
                }}
              >
                <option value="">Tất cả các năm</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              <RotateCcw size={14} style={{ marginRight: 6 }} />
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>

        {/* Layer 3: Data Table - Tối đa 10 dòng/trang */}
        <LeaveRequestTable
          requests={requests}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
          onViewDetail={openDetailModal}
          onCancelRequest={openCancelModal}
          onCreateNew={openCreateModal}
          onResetFilters={resetFilters}
          onRetry={refetch}
        />

        {/* Layer 4: Modals Layer (Modal-First UX) */}
        {/* 1. Modal Tạo đơn */}
        <CreateLeaveModal
          isOpen={isCreateOpen}
          onClose={closeCreateModal}
          onSubmit={handleCreateLeave}
          isSubmitting={isSubmitting}
        />

        {/* 2. Modal Chi tiết */}
        <LeaveDetailModal
          id={detailId}
          isOpen={detailId !== null}
          onClose={closeDetailModal}
          onCancelRequest={(item) => {
            openCancelModal(item);
          }}
        />

        {/* 3. Confirmation Modal Hủy đơn (Rule 33) */}
        <CancelLeaveConfirmModal
          item={cancellingItem}
          isOpen={cancellingItem !== null}
          onClose={closeCancelModal}
          onConfirm={handleCancelLeave}
          isSubmitting={isSubmitting}
        />
      </div>
    </ErrorBoundary>
  );
};
