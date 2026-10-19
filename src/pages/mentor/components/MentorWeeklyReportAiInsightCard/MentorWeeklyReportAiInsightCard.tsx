import React from 'react';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, HelpCircle, Zap, ShieldCheck } from 'lucide-react';
import type { WeeklyReportAiEvaluation } from '../../../../types/assessment.types';
import styles from './MentorWeeklyReportAiInsightCard.module.css';

interface MentorWeeklyReportAiInsightCardProps {
  evaluation: WeeklyReportAiEvaluation | null;
  loading: boolean;
  onEvaluate: () => void;
  onApplySuggestions: (scores: {
    technicalScore: number;
    attitudeScore: number;
    teamworkScore: number;
    productivityScore: number;
    feedback: string;
    nextWeekGoals: string;
  }) => void;
}

export const MentorWeeklyReportAiInsightCard: React.FC<MentorWeeklyReportAiInsightCardProps> = ({
  evaluation,
  loading,
  onEvaluate,
  onApplySuggestions,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingCard}>
        <div className={styles.pulseHeader}>
          <Sparkles className={styles.spinIcon} size={20} />
          <span>Trợ lý AI đang đọc báo cáo & đối soát nhiệm vụ Kanban...</span>
        </div>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
        <div className={styles.skeletonLine} style={{ width: '60%' }} />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className={styles.unEvaluatedCard}>
        <div className={styles.unEvaluatedContent}>
          <div className={styles.unEvaluatedIconBox}>
            <Sparkles size={24} className={styles.sparkleIcon} />
          </div>
          <div>
            <h4 className={styles.unEvaluatedTitle}>Trợ Lý AI Tóm Tắt & Đối Soát Báo Cáo</h4>
            <p className={styles.unEvaluatedDesc}>
              Tự động tóm tắt 3 dòng, đối chiếu nhiệm vụ đã hoàn thành trên bảng Kanban và gợi ý điểm số chuẩn thang 5 sao.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEvaluate}
          className={styles.triggerBtn}
        >
          <Sparkles size={16} /> Phân Tích Bằng AI
        </button>
      </div>
    );
  }

  const { progressSummary, blockersAndRisks, mentorActionAdvice, kanbanAlignment, suggestedAssessment } = evaluation;

  const handleApply = () => {
    onApplySuggestions({
      technicalScore: suggestedAssessment.technicalScore,
      attitudeScore: suggestedAssessment.attitudeScore,
      teamworkScore: suggestedAssessment.teamworkScore,
      productivityScore: suggestedAssessment.productivityScore,
      feedback: suggestedAssessment.feedback,
      nextWeekGoals: suggestedAssessment.nextWeekGoals || '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}>✓ Khớp Kanban ({kanbanAlignment.score}%)</span>;
      case 'PARTIAL_MISMATCH':
        return <span className={`${styles.badge} ${styles.badgeWarning}`}>⚠ Lệch một phần ({kanbanAlignment.score}%)</span>;
      case 'UNVERIFIED_TASKS':
        return <span className={`${styles.badge} ${styles.badgeDanger}`}>✕ Nghi vấn khai lệch ({kanbanAlignment.score}%)</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgeNeutral}`}>Chưa gán nhiệm vụ tuần</span>;
    }
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleBox}>
          <Sparkles size={18} className={styles.sparkleIcon} />
          <span className={styles.headerTitle}>Trợ Lý AI Đánh Giá Tuần</span>
        </div>
        <button
          type="button"
          onClick={onEvaluate}
          className={styles.regenBtn}
          title="Tái phân tích báo cáo tuần"
        >
          <RefreshCw size={14} /> Tái phân tích
        </button>
      </div>

      {/* 3 Dòng Tóm Tắt Cốt Lõi */}
      <div className={styles.summaryList}>
        <div className={`${styles.summaryItem} ${styles.progressItem}`}>
          <div className={styles.itemHeader}>
            <CheckCircle2 size={16} className={styles.successIcon} />
            <strong>1. Tiến độ & Kết quả chính:</strong>
          </div>
          <p className={styles.itemText}>{progressSummary}</p>
        </div>

        <div className={`${styles.summaryItem} ${styles.riskItem}`}>
          <div className={styles.itemHeader}>
            <AlertTriangle size={16} className={styles.warningIcon} />
            <strong>2. Khó khăn & Rủi ro phát sinh:</strong>
          </div>
          <p className={styles.itemText}>{blockersAndRisks}</p>
        </div>

        <div className={`${styles.summaryItem} ${styles.adviceItem}`}>
          <div className={styles.itemHeader}>
            <HelpCircle size={16} className={styles.infoIcon} />
            <strong>3. Gợi ý hành động cho Mentor:</strong>
          </div>
          <p className={styles.itemText}>{mentorActionAdvice}</p>
        </div>
      </div>

      {/* Đối Chiếu Kanban */}
      <div className={styles.kanbanBox}>
        <div className={styles.kanbanHeader}>
          <span className={styles.kanbanTitle}>
            <ShieldCheck size={16} /> Đối Soát Nhiệm Vụ Kanban:
          </span>
          {getStatusBadge(kanbanAlignment.status)}
        </div>
        {kanbanAlignment.details && (
          <p className={styles.kanbanDetails}>{kanbanAlignment.details}</p>
        )}
      </div>

      {/* Gợi Ý Đánh Giá & 1-Click Action */}
      <div className={styles.actionBox}>
        <div className={styles.scorePills}>
          <span className={styles.scorePill}>Chuyên môn: <strong>{suggestedAssessment.technicalScore}★</strong></span>
          <span className={styles.scorePill}>Thái độ: <strong>{suggestedAssessment.attitudeScore}★</strong></span>
          <span className={styles.scorePill}>Đồng đội: <strong>{suggestedAssessment.teamworkScore}★</strong></span>
          <span className={styles.scorePill}>Tiến độ: <strong>{suggestedAssessment.productivityScore}★</strong></span>
          <span className={styles.avgPill}>ĐTB: <strong>{suggestedAssessment.averageScore}</strong>/5.0</span>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className={styles.applyBtn}
        >
          <Zap size={16} /> Áp Dụng Gợi Ý Vào Form Đánh Giá
        </button>
      </div>
    </div>
  );
};
