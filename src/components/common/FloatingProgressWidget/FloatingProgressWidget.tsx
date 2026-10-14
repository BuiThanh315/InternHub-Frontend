import React from 'react';
import {
  Sparkles,
  Maximize2,
  Minus,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';

import { Button } from '../Button/Button';
import { useAiJob } from '../../../contexts/AiJobContext';
import type { FloatingProgressWidgetProps } from './FloatingProgressWidget.types';
import styles from './FloatingProgressWidget.module.css';

const renderRecommendationBadge = (recommendation: string, score: number) => {
  if (recommendation === 'RECOMMENDED_APPROVE') {
    return <span className="badge badge-success">{score}% · Phù hợp cao</span>;
  }
  if (recommendation === 'CONSIDER') {
    return <span className="badge badge-warning">{score}% · Cân nhắc</span>;
  }
  if (recommendation === 'RECOMMENDED_REJECT') {
    return <span className="badge badge-danger">{score}% · Chưa đạt</span>;
  }
  return <span className="badge badge-neutral">{score}% · Đã đánh giá</span>;
};

const getPillTitle = (isCompleted: boolean, isFailed: boolean): string => {
  if (isCompleted) return 'AI đã hoàn tất';
  if (isFailed) return 'AI gặp sự cố';
  return 'Đang thẩm định AI';
};

const getProgressStatusLabel = (isCompleted: boolean, isFailed: boolean): string => {
  if (isCompleted) return 'Đã hoàn tất đánh giá';
  if (isFailed) return 'Đã dừng do lỗi';
  return 'Đang trích xuất & phân tích CV...';
};

export const FloatingProgressWidget: React.FC<FloatingProgressWidgetProps> = ({
  className,
  onViewResults,
}) => {
  const { activeJob, isExpanded, setIsExpanded, dismissJob } = useAiJob();

  if (!activeJob) {
    return null;
  }

  const isCompleted = activeJob.status === 'COMPLETED';
  const isFailed = activeJob.status === 'FAILED';
  const isProcessing = activeJob.status === 'PROCESSING';

  const pillTitle = getPillTitle(isCompleted, isFailed);
  const progressStatusLabel = getProgressStatusLabel(isCompleted, isFailed);

  if (!isExpanded) {
    return (
      <section
        className={`${styles.widgetContainer} ${className || ''}`}
        aria-label="Tiến trình thẩm định hồ sơ AI"
      >
        <div className={styles.collapsedPill}>
          <button
            type="button"
            className="flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer text-left focus:outline-none"
            onClick={() => setIsExpanded(true)}
            title="Nhấn để xem chi tiết tiến trình AI"
            aria-label="Nhấn để xem chi tiết tiến trình AI"
          >
            <div className={styles.pillIconWrapper}>
              <Sparkles
                size={15}
                className={isProcessing ? styles.pillIconSpin : ''}
                aria-hidden="true"
              />
            </div>

            <div className={styles.pillTextGroup}>
              <div className={styles.pillTitle}>{pillTitle}</div>
              <div className={styles.pillSubtitle}>
                {activeJob.percent}% ({activeJob.processedCount}/{activeJob.totalCount} ứng viên)
              </div>
              <div className={styles.pillMiniBar}>
                <div
                  className={`${styles.pillMiniProgress} ${
                    isCompleted ? styles.pillMiniProgressCompleted : ''
                  }`}
                  style={{ width: `${activeJob.percent}%` }}
                />
              </div>
            </div>
          </button>

          <div className={styles.pillActions}>
            <button
              type="button"
              className={styles.pillActionBtn}
              onClick={() => setIsExpanded(true)}
              title="Mở rộng chi tiết"
              aria-label="Mở rộng chi tiết tiến trình"
            >
              <Maximize2 size={12} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.pillActionBtn}
              onClick={dismissJob}
              title="Đóng tiến trình"
              aria-label="Đóng tiến trình"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.widgetContainer} ${className || ''}`}
      aria-label="Tiến trình thẩm định hồ sơ AI chi tiết"
    >
      <div className={styles.expandedCard}>
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleWrapper}>
            <Sparkles size={16} className={styles.headerIcon} aria-hidden="true" />
            <h4 className={styles.headerTitle}>Tiến Trình Thẩm Định AI</h4>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerActionBtn}
              onClick={() => setIsExpanded(false)}
              title="Thu nhỏ tiến trình"
              aria-label="Thu nhỏ tiến trình"
            >
              <Minus size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.headerActionBtn}
              onClick={dismissJob}
              title="Đóng widget"
              aria-label="Đóng widget"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className={styles.cardBody}>
          {/* Progress Section */}
          <div className={styles.progressSection}>
            <div className={styles.progressLabelRow}>
              <span className={styles.progressLabel}>{progressStatusLabel}</span>
              <span
                className={`${styles.progressPercent} ${
                  isCompleted ? styles.progressPercentCompleted : ''
                }`}
              >
                {activeJob.percent}%
              </span>
            </div>

            <div className={styles.progressBarTrack}>
              <div
                className={`${styles.progressBarFill} ${
                  isCompleted ? styles.progressBarFillCompleted : ''
                }`}
                style={{ width: `${activeJob.percent}%` }}
              />
            </div>

            <div className={styles.progressSubtitle}>
              Đã xử lý {activeJob.processedCount} trên tổng số {activeJob.totalCount} hồ sơ
            </div>
          </div>

          {/* Results Section */}
          {activeJob.results && activeJob.results.length > 0 && (
            <div className={styles.resultsSection}>
              <div className={styles.resultsSectionTitle}>
                Kết Quả Thời Gian Thực ({activeJob.results.length})
              </div>
              <div className={styles.resultsList}>
                {activeJob.results.map((res) => (
                  <div key={res.internId} className={styles.resultItem}>
                    <span className={styles.resultInternId}>
                      Ứng viên #{res.internId}
                    </span>
                    {renderRecommendationBadge(res.recommendation, res.overallScore)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Action */}
          {isCompleted && (
            <div className="pt-1">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => {
                  if (onViewResults) {
                    onViewResults();
                  }
                  setIsExpanded(false);
                }}
                leftIcon={<CheckCircle2 size={14} />}
                rightIcon={<ArrowRight size={14} />}
              >
                Xem Kết Quả Trên Danh Sách
              </Button>
            </div>
          )}

          {isFailed && (
            <div className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle size={15} className="shrink-0" />
              <span>Tiến trình gặp lỗi trong lúc xử lý. Vui lòng thử lại sau.</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className={styles.cardFooter}>
          <span className={styles.footerNote}>
            {isProcessing
              ? 'HR có thể tự do đổi trang, hệ thống thẩm định ngầm.'
              : 'Đã hoàn tất toàn bộ hồ sơ trong đợt quét.'}
          </span>
          {isProcessing && <Clock size={12} className="text-slate-400" aria-hidden="true" />}
        </div>
      </div>
    </section>
  );
};
