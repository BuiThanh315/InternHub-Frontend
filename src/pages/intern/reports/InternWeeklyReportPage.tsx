import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Save,
  Send,
  RotateCcw,
  Lock,
  RefreshCw,
  CalendarOff,
  Award,
} from 'lucide-react';

import { Header } from '../../../components/layout/Header';
import {
  Button,
  Skeleton,
  Alert,
  ErrorBoundary,
} from '../../../components/common';
import {
  WeeklyTimelineRail,
  MentorFeedbackShowcase,
  ReportPillarEditor,
  SuggestedTasksModal,
  SubmitConfirmationModal,
  MentorAssessmentDetailModal,
} from './components';

import { useInternWeeklyReport } from '../../../hooks/useInternWeeklyReport';
import { formatDate } from '../../../utils/formatters';
import styles from './InternWeeklyReportPage.module.css';

const InternWeeklyReportContent: React.FC = () => {
  const {
    timeline,
    selectedWeekNumber,
    currentTimelineItem,
    selectWeek,
    reportDetail,
    formValues,
    updateFormField,
    resetForm,
    isDirty,
    isEditable,
    suggestedTasks,
    isLoadingSuggestions,
    loadSuggestedTasks,
    applySuggestedTasks,
    metrics,
    isLoadingTimeline,
    isLoadingDetail,
    isSavingDraft,
    isSubmitting,
    error,
    saveDraft,
    submitReport,
    reloadAll,
  } = useInternWeeklyReport();

  // Modals local state
  const [isKanbanModalOpen, setIsKanbanModalOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  // Mở modal gợi ý Kanban
  const handleOpenKanbanModal = () => {
    setIsKanbanModalOpen(true);
    void loadSuggestedTasks();
  };

  // Xác nhận nộp báo cáo từ modal
  const handleConfirmSubmit = async () => {
    const success = await submitReport();
    if (success) {
      setIsSubmitConfirmOpen(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Lớp 1: Header Bar */}
      <Header
        title="Báo Cáo Tuần (Weekly Reflection & Report)"
        subtitle="Theo dõi trục tiến độ thực tập, tự động tổng hợp task từ Kanban và soạn thảo 4 trụ cột báo cáo cho Mentor"
      />

      {/* Lớp 2: Metrics Strip */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.iconWeeks}`}>
            <Calendar size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng số tuần thực tập</span>
            <span className={styles.metricValue}>{metrics.totalWeeks}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.iconSubmitted}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Báo cáo đã nộp</span>
            <span className={styles.metricValue}>{metrics.submittedCount}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.iconDrafts}`}>
            <Clock size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Đang lưu nháp</span>
            <span className={styles.metricValue}>{metrics.draftCount}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrapper} ${styles.iconScore}`}>
            <Star size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Điểm trung bình Mentor</span>
            <span className={styles.metricValue}>
              {metrics.averageScore !== null ? `${metrics.averageScore} / 5.0` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Lớp 3: Master-Detail Ergonomic Workspace */}
      {error ? (
        <Alert type="error">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void reloadAll()}>
              <RotateCcw size={14} /> Thử lại
            </Button>
          </div>
        </Alert>
      ) : isLoadingTimeline ? (
        /* Trạng thái 1: Skeleton Loading (Rule 32) */
        <div className={styles.workspaceLayout}>
          <Skeleton variant="card" height="400px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton variant="card" height="90px" />
            <Skeleton variant="card" height="160px" />
            <Skeleton variant="card" height="160px" />
          </div>
        </div>
      ) : timeline.length === 0 ? (
        /* Trạng thái 2: Empty State */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconWrapper}>
            <CalendarOff size={32} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa có thông tin kỳ thực tập</h3>
          <p className={styles.emptyDescription}>
            Hồ sơ thực tập của bạn chưa được phân bổ vào chương trình đào tạo hoặc chưa có ngày bắt đầu chính thức. Vui lòng liên hệ HR hoặc Mentor để được hỗ trợ.
          </p>
        </div>
      ) : (
        <div className={styles.workspaceLayout}>
          {/* CỘT TRÁI: TRỤC TIẾN ĐỘ THỜI GIAN (TIMELINE RAIL) */}
          <WeeklyTimelineRail
            timeline={timeline}
            selectedWeekNumber={selectedWeekNumber}
            onSelectWeek={selectWeek}
          />

          {/* CỘT PHẢI: KHUNG SOẠN THẢO PHẢN TƯ (CANVAS) */}
          <main className={styles.canvasColumn} aria-label="Khu vực soạn thảo báo cáo">
            {isLoadingDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Skeleton variant="card" height="80px" />
                <Skeleton variant="card" height="140px" />
                <Skeleton variant="card" height="140px" />
                <Skeleton variant="card" height="140px" />
              </div>
            ) : currentTimelineItem ? (
              <>
                {/* Banner Thông Tin Tuần & Trạng Thái */}
                <div className={styles.canvasBanner}>
                  <div className={styles.bannerTitleGroup}>
                    <div className={styles.bannerWeekTitle}>
                      <span>Báo Cáo Tuần {currentTimelineItem.weekNumber}</span>
                      {currentTimelineItem.isCurrentWeek && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                          (Tuần làm việc hiện tại)
                        </span>
                      )}
                    </div>
                    <span className={styles.bannerDateRange}>
                      Khoảng thời gian: {formatDate(currentTimelineItem.startDate)} đến {formatDate(currentTimelineItem.endDate)}
                    </span>
                  </div>

                  <div className={styles.bannerActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void reloadAll()}
                      title="Làm mới dữ liệu từ máy chủ"
                    >
                      <RefreshCw size={14} />
                      <span>Làm mới</span>
                    </Button>
                  </div>
                </div>

                {/* Banner Thông Báo Khóa (Nếu đã đánh giá hoặc không được sửa) */}
                {!isEditable && (
                  <div className={styles.lockedBanner}>
                    <Lock size={16} />
                    <span>
                      {currentTimelineItem.status === 'REVIEWED'
                        ? 'Báo cáo tuần này đã được Mentor hoàn tất đánh giá và công bố điểm. Nội dung đã được khóa cứng.'
                        : 'Tuần này hiện chưa mở quyền chỉnh sửa hoặc đã quá thời hạn.'}
                    </span>
                  </div>
                )}

                {/* Showcase Đánh Giá Của Mentor (Nếu có) */}
                <MentorFeedbackShowcase
                  mentorName={reportDetail?.mentorName || reportDetail?.mentorAssessment?.mentorName}
                  mentorScore={reportDetail?.mentorScore ?? reportDetail?.mentorAssessment?.averageScore}
                  mentorFeedback={reportDetail?.mentorFeedback || reportDetail?.mentorAssessment?.feedback}
                  reviewedAt={reportDetail?.reviewedAt || reportDetail?.mentorAssessment?.publishedAt}
                  onViewDetails={() => setIsAssessmentModalOpen(true)}
                />

                {/* Khung Soạn Thảo 4 Trụ Cột */}
                <ReportPillarEditor
                  formValues={formValues}
                  onChangeField={updateFormField}
                  isEditable={isEditable}
                  onOpenKanbanModal={handleOpenKanbanModal}
                  tasks={reportDetail?.tasks || []}
                />

                {/* Thanh Sticky Action Bar ở đáy khi đang mở quyền chỉnh sửa */}
                {isEditable && (
                  <div className={styles.stickyActionBar}>
                    <div className={styles.actionStatusInfo}>
                      {isDirty && <span className={styles.dirtyIndicator} />}
                      <span>
                        {isDirty
                          ? 'Có thay đổi chưa được lưu'
                          : currentTimelineItem.status === 'SUBMITTED'
                          ? 'Báo cáo đã nộp (bạn vẫn có thể sửa lại trước khi Mentor chấm điểm)'
                          : 'Dữ liệu đã được đồng bộ'}
                      </span>
                    </div>

                    <div className={styles.actionButtonsGroup}>
                      {isDirty && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetForm}
                          disabled={isSavingDraft || isSubmitting}
                        >
                          <RotateCcw size={14} />
                          <span>Khôi phục</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void saveDraft()}
                        disabled={isSavingDraft || isSubmitting}
                      >
                        <Save size={14} className={isSavingDraft ? 'animate-spin' : ''} />
                        <span>{isSavingDraft ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsSubmitConfirmOpen(true)}
                        disabled={isSavingDraft || isSubmitting}
                      >
                        <Send size={14} />
                        <span>
                          {currentTimelineItem.status === 'SUBMITTED'
                            ? 'Cập nhật báo cáo'
                            : 'Nộp báo cáo tuần'}
                        </span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Thanh Action Xem Chi Tiết Đánh Giá ở đáy khi báo cáo đã được Mentor đánh giá */}
                {!isEditable && (currentTimelineItem.status === 'REVIEWED' || Boolean(reportDetail?.mentorAssessment)) && (
                  <div className={styles.reviewedActionCard}>
                    <div className={styles.reviewedActionMeta}>
                      <div className={styles.reviewedActionIcon}>
                        <Award size={20} />
                      </div>
                      <div className={styles.reviewedActionText}>
                        <span className={styles.reviewedActionTitle}>
                          Báo cáo tuần {currentTimelineItem.weekNumber} đã được Mentor hoàn tất đánh giá & công bố
                        </span>
                        <span className={styles.reviewedActionSubtitle}>
                          Điểm đánh giá: {reportDetail?.mentorScore ?? reportDetail?.mentorAssessment?.averageScore ?? '--'} / 5.0 • Xem chi tiết 4 tiêu chí rubrics và định hướng tuần tới
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAssessmentModalOpen(true)}
                    >
                      <Award size={15} />
                      <span>Xem chi tiết đánh giá của Mentor</span>
                    </Button>
                  </div>
                )}
              </>
            ) : null}
          </main>
        </div>
      )}

      {/* Lớp 4: Modals (Modal-First UX) */}
      <SuggestedTasksModal
        isOpen={isKanbanModalOpen}
        onClose={() => setIsKanbanModalOpen(false)}
        suggestedTasks={suggestedTasks}
        isLoading={isLoadingSuggestions}
        onApply={applySuggestedTasks}
      />

      <SubmitConfirmationModal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={() => void handleConfirmSubmit()}
        isSubmitting={isSubmitting}
        weekNumber={selectedWeekNumber || 1}
        isAlreadySubmitted={currentTimelineItem?.status === 'SUBMITTED'}
      />

      <MentorAssessmentDetailModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        weekNumber={selectedWeekNumber || 1}
        assessment={reportDetail?.mentorAssessment}
        fallbackScore={reportDetail?.mentorScore}
        fallbackFeedback={reportDetail?.mentorFeedback}
        fallbackMentorName={reportDetail?.mentorName}
        fallbackReviewedAt={reportDetail?.reviewedAt}
      />
    </div>
  );
};

export const InternWeeklyReportPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <InternWeeklyReportContent />
    </ErrorBoundary>
  );
};

export default InternWeeklyReportPage;
