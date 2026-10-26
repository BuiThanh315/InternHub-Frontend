import React from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Maximize2,
  Minus,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Briefcase,
  BookOpen,
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

const QUESTION_STAGES = [
  { step: 1, percent: 25, label: 'Trích xuất JD & Hồ sơ ứng viên' },
  { step: 2, percent: 60, label: 'Gemini AI sinh câu hỏi & Tiêu chí' },
  { step: 3, percent: 85, label: 'Chuẩn hóa & Lưu trữ bộ câu hỏi' },
  { step: 4, percent: 100, label: 'Hoàn tất & Sẵn sàng phỏng vấn' },
];

const QUIZ_STAGES = [
  { step: 1, percent: 25, label: 'Phân tích chủ đề & cấu trúc bài kiểm tra' },
  { step: 2, percent: 60, label: 'Gemini AI biên soạn câu hỏi & giải thích đáp án' },
  { step: 3, percent: 85, label: 'Chuẩn hóa dữ liệu & lưu trữ bài Quiz' },
  { step: 4, percent: 100, label: 'Hoàn tất & sẵn sàng ôn tập' },
];

export const FloatingProgressWidget: React.FC<FloatingProgressWidgetProps> = ({
  className,
  onViewResults,
}) => {
  const { activeJob, isExpanded, setIsExpanded, dismissJob, openQuestionModal, consumeCompletedQuiz } = useAiJob();

  if (!activeJob) {
    return null;
  }

  const isInterviewJob = activeJob.jobType === 'INTERVIEW_QUESTIONS';
  const isQuizJob = activeJob.jobType === 'QUIZ';
  const isCompleted = activeJob.status === 'COMPLETED';
  const isFailed = activeJob.status === 'FAILED';
  const isProcessing = activeJob.status === 'PROCESSING';

  // Pill Title & Subtitle
  const pillTitle = isQuizJob
    ? isCompleted
      ? 'Bài Quiz hoàn tất'
      : isFailed
      ? 'Lỗi tạo Quiz'
      : 'Đang tạo Quiz AI'
    : isInterviewJob
    ? isCompleted
      ? 'Bộ câu hỏi hoàn tất'
      : isFailed
      ? 'Lỗi tạo câu hỏi'
      : 'Đang sinh câu hỏi AI'
    : isCompleted
    ? 'AI đã hoàn tất'
    : isFailed
    ? 'AI gặp sự cố'
    : 'Đang thẩm định AI';

  const pillSubtitle = isQuizJob
    ? `${activeJob.percent}% · ${activeJob.currentStage || activeJob.quizTopic || 'Đang tạo'}`
    : isInterviewJob
    ? `${activeJob.percent}% · ${activeJob.currentStage || (activeJob.internName ? activeJob.internName : (activeJob.programName || 'Đang tạo'))}`
    : `${activeJob.percent}% (${activeJob.processedCount || 0}/${activeJob.totalCount || 0} ứng viên)`;

  // Expanded Status Label
  const progressStatusLabel = isQuizJob
    ? isCompleted
      ? 'Đã hoàn tất tạo bài kiểm tra'
      : isFailed
      ? 'Đã dừng do lỗi'
      : activeJob.currentStage || 'Đang tạo bài Quiz với Gemini AI...'
    : isInterviewJob
    ? isCompleted
      ? 'Đã hoàn tất sinh bộ câu hỏi'
      : isFailed
      ? 'Đã dừng do lỗi'
      : activeJob.currentStage || 'Đang tạo câu hỏi với Gemini AI...'
    : isCompleted
    ? 'Đã hoàn tất đánh giá'
    : isFailed
    ? 'Đã dừng do lỗi'
    : 'Đang trích xuất & phân tích CV...';

  // =========================================================================
  // COLLAPSED PILL STATE
  // =========================================================================
  if (!isExpanded) {
    return (
      <section
        className={`${styles.widgetContainer} ${className || ''}`}
        aria-label={isQuizJob ? 'Tiến trình tạo bài Quiz AI' : isInterviewJob ? 'Tiến trình sinh câu hỏi phỏng vấn AI' : 'Tiến trình thẩm định hồ sơ AI'}
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
              <div className={styles.pillSubtitle}>{pillSubtitle}</div>
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

  // =========================================================================
  // EXPANDED CARD STATE
  // =========================================================================
  return (
    <section
      className={`${styles.widgetContainer} ${className || ''}`}
      aria-label={
        isQuizJob
          ? 'Tiến trình tạo bài Quiz AI chi tiết'
          : isInterviewJob
          ? 'Tiến trình sinh câu hỏi phỏng vấn AI chi tiết'
          : 'Tiến trình thẩm định hồ sơ AI chi tiết'
      }
    >
      <div className={styles.expandedCard}>
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleWrapper}>
            <Sparkles size={16} className={styles.headerIcon} aria-hidden="true" />
            <h4 className={styles.headerTitle}>
              {isQuizJob ? 'Tiến Trình Tạo Bài Quiz AI' : isInterviewJob ? 'Tiến Trình Sinh Câu Hỏi AI' : 'Tiến Trình Thẩm Định AI'}
            </h4>
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
          {/* Scope Badge for Quiz Job */}
          {isQuizJob && (
            <div className={styles.scopeBadge}>
              <BookOpen size={11} />
              <span>Chủ đề: {activeJob.quizTopic || 'Quiz AI'}</span>
              {activeJob.difficulty && (
                <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
                  · {activeJob.difficulty === 'HARD' ? 'Nâng cao' : activeJob.difficulty === 'EASY' ? 'Cơ bản' : 'Vận dụng'}
                  {activeJob.questionCount ? ` · ${activeJob.questionCount} câu` : ''}
                </span>
              )}
            </div>
          )}

          {/* Scope Badge for Interview Job */}
          {isInterviewJob && (
            <div className={styles.scopeBadge}>
              {activeJob.internName ? (
                <>
                  <User size={11} />
                  <span>Ứng viên: {activeJob.internName}</span>
                </>
              ) : (
                <>
                  <Briefcase size={11} />
                  <span>Vị trí: {activeJob.programName || 'Chương trình'}</span>
                </>
              )}
            </div>
          )}

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
              {isQuizJob
                ? `Bài kiểm tra: ${activeJob.quizTopic || 'Ôn tập kiến thức'}`
                : isInterviewJob
                ? activeJob.targetRole
                  ? `Vị trí chuyên môn: ${activeJob.targetRole}`
                  : `Phạm vi: ${activeJob.programName || 'Chương trình tuyển dụng'}`
                : `Đã xử lý ${activeJob.processedCount || 0} trên tổng số ${activeJob.totalCount || 0} hồ sơ`}
            </div>
          </div>

          {/* Stepped Stages Checklist for Quiz Job */}
          {isQuizJob && (
            <div className={styles.stagesList}>
              {QUIZ_STAGES.map((st) => {
                const isStageDone = activeJob.percent >= st.percent;
                const isStageCurrent =
                  !isStageDone && activeJob.percent >= st.percent - 35;

                return (
                  <div
                    key={st.step}
                    className={`${styles.stageItem} ${
                      isStageDone
                        ? styles.stageItemDone
                        : isStageCurrent
                        ? styles.stageItemCurrent
                        : styles.stageItemPending
                    }`}
                  >
                    {isStageDone ? (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    ) : isStageCurrent ? (
                      <Sparkles size={13} className="text-indigo-500 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stepped Stages Checklist for Interview Question Job */}
          {isInterviewJob && (
            <div className={styles.stagesList}>
              {QUESTION_STAGES.map((st) => {
                const isStageDone = activeJob.percent >= st.percent;
                const isStageCurrent =
                  !isStageDone && activeJob.percent >= st.percent - 35;

                return (
                  <div
                    key={st.step}
                    className={`${styles.stageItem} ${
                      isStageDone
                        ? styles.stageItemDone
                        : isStageCurrent
                        ? styles.stageItemCurrent
                        : styles.stageItemPending
                    }`}
                  >
                    {isStageDone ? (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    ) : isStageCurrent ? (
                      <Sparkles size={13} className="text-indigo-500 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Section for Screening Job */}
          {!isInterviewJob && activeJob.results && activeJob.results.length > 0 && (
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
              {isQuizJob ? (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    consumeCompletedQuiz();
                    toast.info('Bài Quiz đã sẵn sàng! Hãy mở form giao việc để đính kèm.', {
                      description: `Quiz "${activeJob.quizTopic || 'Ôn tập'}" có thể được đính kèm khi tạo công việc.`,
                    });
                    setIsExpanded(false);
                    dismissJob();
                  }}
                  leftIcon={<BookOpen size={14} />}
                  rightIcon={<ArrowRight size={14} />}
                >
                  ✦ Bài Quiz Đã Sẵn Sàng
                </Button>
              ) : isInterviewJob ? (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    openQuestionModal({
                      programId: activeJob.programId,
                      programName: activeJob.programName || '',
                      internId: activeJob.internId ?? undefined,
                      internName: activeJob.internName,
                      questionSetId: activeJob.questionSetId ?? undefined,
                    });
                    setIsExpanded(false);
                  }}
                  leftIcon={<Sparkles size={14} />}
                  rightIcon={<ArrowRight size={14} />}
                >
                  ✦ Xem Bộ Câu Hỏi Vừa Tạo
                </Button>
              ) : (
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
              )}
            </div>
          )}

          {/* Failed State */}
          {isFailed && (
            <div className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle size={15} className="shrink-0" />
              <span>
                {activeJob.errorMessage ||
                  'Tiến trình gặp lỗi trong lúc xử lý. Vui lòng thử lại sau.'}
              </span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className={styles.cardFooter}>
          <span className={styles.footerNote}>
            {isQuizJob
              ? isProcessing
                ? 'Mentor có thể tiếp tục giao việc, Quiz tạo ngầm.'
                : 'Bài kiểm tra đã được lưu vào hệ thống.'
              : isInterviewJob
              ? isProcessing
                ? 'HR có thể tự do thao tác, đa luồng xử lý ngầm.'
                : 'Bộ câu hỏi đã được lưu vào hệ thống.'
              : isProcessing
              ? 'HR có thể tự do đổi trang, hệ thống thẩm định ngầm.'
              : 'Đã hoàn tất toàn bộ hồ sơ trong đợt quét.'}
          </span>
          {isProcessing && <Clock size={12} className="text-slate-400" aria-hidden="true" />}
        </div>
      </div>
    </section>
  );
};
