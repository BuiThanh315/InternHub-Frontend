import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Code2,
  Calendar,
  AlertCircle,
  Send,
  Zap,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Skeleton } from '../../../components/common';
import { useAiJob } from '../../../contexts/AiJobContext';
import { aiService } from '../../../services/aiService';
import { aiInterviewService } from '../../../services/aiInterviewService';
import { CreateInterviewScheduleModal } from './CreateInterviewScheduleModal';
import { formatDateTime } from '../../../utils/formatters';
import type { ScreeningResultDto } from '../../../types';
import type { AiScreeningDossierTabProps } from './AiScreeningDossierTab.types';
import styles from './AiScreeningDossierTab.module.css';

const getScoreCircleClass = (isHigh: boolean, isMedium: boolean): string => {
  if (isHigh) return styles.scoreCircleSuccess;
  if (isMedium) return styles.scoreCircleWarning;
  return styles.scoreCircleDanger;
};

const getBadgeClass = (isHigh: boolean, isMedium: boolean): string => {
  if (isHigh) return 'badge-success';
  if (isMedium) return 'badge-warning';
  return 'badge-danger';
};

const getRecommendationLabel = (isHigh: boolean, isMedium: boolean): string => {
  if (isHigh) return 'Khuyến nghị tiếp nhận (RECOMMENDED APPROVE)';
  if (isMedium) return 'Cân nhắc phỏng vấn (CONSIDER)';
  return 'Chưa đạt tiêu chí kỳ này (RECOMMENDED REJECT)';
};

export const AiScreeningDossierTab: React.FC<AiScreeningDossierTabProps> = ({
  intern,
  onApplyRejectionReason,
}) => {
  const { startJob, completedVersion } = useAiJob();

  // Rule 14: Tối đa 3 state cho sub-component + state modal thao tác
  const [data, setData] = useState<ScreeningResultDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [hasExistingSession, setHasExistingSession] = useState<boolean>(false);

  const checkExistingInterview = useCallback(async () => {
    try {
      const session = await aiInterviewService.getCandidateInterviewSession({
        candidateId: intern.id,
        email: intern.email,
      });
      if (session && session.sessionId) {
        setHasExistingSession(true);
      }
    } catch {
      // Ignored
    }
  }, [intern.id, intern.email]);

  useEffect(() => {
    checkExistingInterview();
  }, [checkExistingInterview]);

  const fetchEvaluation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await aiService.getInternEvaluation(intern.id);
      setData(res);
    } catch (err: any) {
      console.error('Lỗi khi nạp dữ liệu đánh giá AI:', err);
      setError(err?.response?.data?.message || 'Không thể tải kết quả thẩm định AI');
    } finally {
      setIsLoading(false);
    }
  }, [intern.id]);

  useEffect(() => {
    void fetchEvaluation();
  }, [fetchEvaluation, completedVersion]);

  // Kích hoạt thẩm định AI trực tiếp cho hồ sơ này
  const handleTriggerScreening = async () => {
    if (!intern.programId) {
      toast.error('Hồ sơ chưa thuộc kỳ thực tập nào để thẩm định.');
      return;
    }
    try {
      setIsLoading(true);
      await startJob(intern.programId, [intern.id]);
    } catch (err: any) {
      console.error('Lỗi khởi tạo thẩm định AI:', err);
      toast.error('Không thể kích hoạt thẩm định AI.');
      setIsLoading(false);
    }
  };

  // Loading State (Skeleton Shimmer - Rule 32)
  if (isLoading) {
    return (
      <output className="space-y-4 py-3 block" aria-label="Đang nạp hồ sơ AI">
        <Skeleton height={110} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height={140} />
          <Skeleton height={140} />
        </div>
        <Skeleton height={80} />
        <Skeleton height={120} />
      </output>
    );
  }

  // Error State với nút Retry (Rule 32)
  if (error) {
    return (
      <div
        className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center justify-between gap-3 text-sm text-rose-700 dark:text-rose-300"
        role="alert"
      >
        <div className="flex items-center gap-2">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchEvaluation}>
          Thử lại
        </Button>
      </div>
    );
  }

  // Empty State có nút CTA hành động (Rule 32)
  if (!data) {
    return (
      <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles size={24} aria-hidden="true" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          Chưa Có Kết Quả Thẩm Định AI
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
          Hồ sơ này chưa được thẩm định bằng AI. Nhấn nút bên dưới để hệ thống trích xuất CV và đối
          soát năng lực với tiêu chuẩn kỳ thực tập.
        </p>
        <Button
          variant="primary"
          onClick={handleTriggerScreening}
          leftIcon={<Sparkles size={16} />}
        >
          Kích Hoạt Thẩm Định AI Ngay
        </Button>
      </div>
    );
  }

  const score = data.overallScore;
  const isHigh = score >= 75;
  const isMedium = score >= 50 && score < 75;

  const scoreCircleClass = getScoreCircleClass(isHigh, isMedium);
  const badgeClass = getBadgeClass(isHigh, isMedium);
  const recommendationLabel = getRecommendationLabel(isHigh, isMedium);

  return (
    <div className={styles.tabContainer}>
      {/* 1. Score Hero Card */}
      <section className={styles.scoreHeroCard} aria-label="Điểm số đánh giá AI">
        <div className={`${styles.scoreCircleWrapper} ${scoreCircleClass}`}>
          <span className={styles.scoreNumber}>{score}</span>
          <span className={styles.scoreMax}>/ 100 điểm</span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroTopRow}>
            <span className={`badge ${badgeClass}`}>
              <Sparkles size={12} aria-hidden="true" />
              {recommendationLabel}
            </span>

            {data.fromCache && (
              <span className="badge badge-neutral text-xs">
                <Zap size={11} aria-hidden="true" />
                Bộ nhớ đệm AI
              </span>
            )}
          </div>

          <p className={styles.matchSummaryText}>{data.matchSummary}</p>

          <div className={styles.metaInfoText}>
            <Calendar size={13} aria-hidden="true" />
            <span>Thời gian thẩm định: {formatDateTime(data.evaluatedAt)}</span>
          </div>
        </div>
      </section>

      {/* CẦU NỐI E2E: Thanh Hành Động Lên Lịch & Mời Phỏng Vấn AI (Nổi bật, độc lập) */}
      <div className="bg-white border-2 border-indigo-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Video size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              Buồng Phỏng Vấn AI (AI Interview Virtual Room)
            </div>
            <div className="text-xs text-slate-500">
              {hasExistingSession
                ? 'Ứng viên này đã được cấp phòng phỏng vấn trực tuyến. Bạn có thể xem kết quả ở tab bên cạnh.'
                : 'Mời ứng viên làm bài thi phỏng vấn kỹ thuật trực tuyến với AI Grader tự động.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasExistingSession ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
              <CheckCircle size={14} className="text-purple-600" />
              Đã Lên Lịch Phỏng Vấn AI
            </span>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
              leftIcon={<Video size={15} />}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm px-3.5 py-1.5"
            >
              Lên Lịch & Mời Phỏng Vấn AI
            </Button>
          )}
        </div>
      </div>

      {/* 2. Comparative Dossier (Điểm mạnh vs Điểm cần lưu ý) */}
      <section className={styles.dossierGrid} aria-label="Bảng đối chiếu điểm mạnh và điểm lưu ý">
        {/* Cột Điểm mạnh */}
        <div className={`${styles.dossierCard} ${styles.dossierCardStrengths}`}>
          <h5 className={styles.dossierCardTitle}>
            <CheckCircle size={15} className="text-emerald-500" aria-hidden="true" />
            Điểm Mạnh Nổi Bật ({data.strengths.length})
          </h5>
          <ul className={styles.dossierList}>
            {data.strengths.map((str) => (
              <li key={str} className={styles.dossierListItem}>
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột Điểm cần lưu ý */}
        <div className={`${styles.dossierCard} ${styles.dossierCardWeaknesses}`}>
          <h5 className={styles.dossierCardTitle}>
            <AlertTriangle size={15} className="text-amber-500" aria-hidden="true" />
            Điểm Cần Lưu Ý &amp; Lỗ Hổng ({data.weaknesses.length})
          </h5>
          <ul className={styles.dossierList}>
            {data.weaknesses.map((weak) => (
              <li key={weak} className={styles.dossierListItem}>
                <span className="text-amber-500 font-bold">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Matched Competencies */}
      {data.skillsMatched && data.skillsMatched.length > 0 && (
        <section className={styles.skillsCard} aria-label="Kỹ năng đối chiếu">
          <h5 className={styles.skillsTitle}>
            <Code2 size={15} className="text-indigo-600" aria-hidden="true" />
            Kỹ Năng Đối Chiếu Với Kỳ Thực Tập ({data.skillsMatched.length})
          </h5>
          <div className={styles.skillsWrap}>
            {data.skillsMatched.map((skill) => (
              <span key={skill} className={styles.skillChip}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 4. Suggested Interview Questions */}
      {data.suggestedInterviewQuestions && data.suggestedInterviewQuestions.length > 0 && (
        <section className={styles.questionsCard} aria-label="Gợi ý câu hỏi phỏng vấn">
          <h5 className={styles.questionsTitle}>
            <HelpCircle size={15} className="text-sky-500" aria-hidden="true" />
            Gợi Ý Câu Hỏi Phỏng Vấn Chuyên Sâu ({data.suggestedInterviewQuestions.length})
          </h5>
          <ol className={styles.questionsList}>
            {data.suggestedInterviewQuestions.map((q, idx) => (
              <li key={q} className={styles.questionItem}>
                <span className={styles.questionNumber}>{idx + 1}</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 5. Draft Rejection Reason Action Banner */}
      {data.draftRejectionReason && (
        <aside className={styles.rejectionDraftBanner} aria-label="Lý do từ chối mẫu từ AI">
          <div className={styles.draftContent}>
            <h6 className={styles.draftTitle}>
              <AlertCircle size={14} aria-hidden="true" />
              Lý Do Từ Chối Mẫu Do AI Đề Xuất:
            </h6>
            <p className={styles.draftText}>&ldquo;{data.draftRejectionReason}&rdquo;</p>
          </div>

          {onApplyRejectionReason && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onApplyRejectionReason(data.draftRejectionReason || '')}
              leftIcon={<Send size={13} />}
            >
              Áp Dụng Lý Do Này
            </Button>
          )}
        </aside>
      )}

      {/* Modal Lên Lịch & Mời Phỏng Vấn AI Trực Tiếp Cho Ứng Viên Này */}
      {isInviteModalOpen && (
        <CreateInterviewScheduleModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={() => {
            setIsInviteModalOpen(false);
            setHasExistingSession(true);
            toast.success(`Đã tạo lịch và gửi liên kết buồng thi AI tới email: ${intern.email}`);
          }}
          programId={intern.programId || undefined}
          initialCandidates={[
            {
              candidateId: intern.id,
              fullName: intern.fullName,
              email: intern.email,
            },
          ]}
        />
      )}
    </div>
  );
};
