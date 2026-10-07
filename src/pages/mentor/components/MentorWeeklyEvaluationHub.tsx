import React, { useState, useEffect, useMemo } from 'react';
import { Star, Sparkles, Send, Save, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { WeeklyAssessment, CreateWeeklyAssessmentPayload } from '../../../types';
import { useMentorWeeklyReview } from '../hooks/useMentorWeeklyReview';
import { MentorWeeklyReportInspectionView } from './MentorWeeklyReportInspectionView';
import { MentorRequestRevisionModal } from './MentorRequestRevisionModal';
import styles from './MentorWeeklyEvaluationHub.module.css';

interface MentorWeeklyEvaluationHubProps {
  internCode: string;
  internName: string;
  currentWeek: number;
  historyAssessments: WeeklyAssessment[];
  onSaveAssessment: (payload: CreateWeeklyAssessmentPayload) => Promise<void>;
  loading?: boolean;
}

interface RubricScores {
  technicalScore: number;
  attitudeScore: number;
  teamworkScore: number;
  productivityScore: number;
}

const TEMPLATES = [
  {
    label: '🌟 Xuất sắc (5⭐)',
    feedback: 'Tiếp thu kiến trúc rất nhanh, chủ động giải quyết vấn đề và hỗ trợ đồng đội xuất sắc. Hoàn thành task đúng và vượt tiến độ đề ra.',
    goals: 'Nghiên cứu sâu hơn về Distributed Caching (Redis), tối ưu hóa latency và chuẩn bị bài thuyết trình kỹ thuật nội bộ.',
  },
  {
    label: '👍 Đạt yêu cầu (4⭐)',
    feedback: 'Hoàn thành các đầu việc được giao đúng cam kết. Cần chủ động trao đổi sớm hơn khi gặp vướng mắc kỹ thuật phức tạp.',
    goals: 'Tăng cường viết Unit Test bao phủ các edge cases, cải thiện kỹ năng debug và refactor code sạch sẽ hơn.',
  },
  {
    label: '⚠️ Cần cải thiện (2-3⭐)',
    feedback: 'Tiến độ làm việc tuần này còn chậm so với kế hoạch. Cần tập trung hơn vào giờ làm việc và chủ động báo cáo khó khăn hàng ngày.',
    goals: 'Rà soát lại tài liệu nghiệp vụ, hoàn thành dứt điểm các task tồn đọng và trao đổi trực tiếp 1-1 với Mentor vào đầu tuần tới.',
  },
];

export const MentorWeeklyEvaluationHub: React.FC<MentorWeeklyEvaluationHubProps> = ({
  internCode,
  internName,
  currentWeek,
  historyAssessments,
  onSaveAssessment,
}) => {
  // 1. Custom Hook quản lý dữ liệu đối soát tuần (Rule 18, 20)
  const {
    selectedWeek,
    reviewData,
    loading: reviewLoading,
    isSubmitting: reviewSubmitting,
    changeWeek,
    saveAssessment,
    requestRevision,
  } = useMentorWeeklyReview({
    internCode,
    initialWeek: currentWeek || 1,
    onAssessmentSaved: () => {
      // Callback nếu component cha muốn cập nhật danh sách
    },
  });

  // 2. State cục bộ khống chế tối đa 4 state (Rule 14)
  const [scores, setScores] = useState<RubricScores>({
    technicalScore: 4,
    attitudeScore: 5,
    teamworkScore: 4,
    productivityScore: 4,
  });
  const [feedback, setFeedback] = useState<string>('');
  const [nextWeekGoals, setNextWeekGoals] = useState<string>('');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);

  // 3. Đồng bộ form khi dữ liệu reviewData nạp thành công
  useEffect(() => {
    if (reviewData?.assessment) {
      setScores({
        technicalScore: reviewData.assessment.technicalScore || 4,
        attitudeScore: reviewData.assessment.attitudeScore || 5,
        teamworkScore: reviewData.assessment.teamworkScore || 4,
        productivityScore: reviewData.assessment.productivityScore || 4,
      });
      setFeedback(reviewData.assessment.feedback || '');
      setNextWeekGoals(reviewData.assessment.nextWeekGoals || '');
    } else {
      setScores({
        technicalScore: 4,
        attitudeScore: 5,
        teamworkScore: 4,
        productivityScore: 4,
      });
      setFeedback('');
      setNextWeekGoals('');
    }
  }, [reviewData]);

  // Tính điểm trung bình thời gian thực
  const averageScore = useMemo(() => {
    const total = scores.technicalScore + scores.attitudeScore + scores.teamworkScore + scores.productivityScore;
    return Number((total / 4).toFixed(1));
  }, [scores]);

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setFeedback(tpl.feedback);
    setNextWeekGoals(tpl.goals);
    toast.info(`Đã áp dụng mẫu nhận xét: ${tpl.label}`);
  };

  const handleSave = async (isPublish: boolean) => {
    if (!feedback.trim()) {
      toast.error('Vui lòng nhập nội dung nhận xét tuần này.');
      return;
    }

    const payload: CreateWeeklyAssessmentPayload = {
      weekNumber: selectedWeek,
      technicalScore: scores.technicalScore,
      attitudeScore: scores.attitudeScore,
      teamworkScore: scores.teamworkScore,
      productivityScore: scores.productivityScore,
      feedback,
      nextWeekGoals,
      isPublish,
    };

    try {
      await saveAssessment(payload);
      // Gọi callback để đồng bộ với state của MentorDashboard nếu có
      await onSaveAssessment(payload);
    } catch {
      // Đã xử lý toast lỗi trong hook
    }
  };

  const handleRequestRevisionSubmit = async (revisionNote: string) => {
    await requestRevision(revisionNote);
  };

  const renderStarSelector = (
    label: string,
    score: number,
    onScoreChange: (newScore: number) => void
  ) => {
    return (
      <div className={styles.rubricRow}>
        <span className={styles.rubricLabel}>{label}</span>
        <div className={styles.starGroup}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.starBtn} ${star <= score ? styles.starFilled : styles.starEmpty}`}
              onClick={() => onScoreChange(star)}
              title={`${star} sao`}
            >
              <Star size={18} fill={star <= score ? '#f59e0b' : 'transparent'} />
            </button>
          ))}
          <span className={styles.scoreText}>{score}/5</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header Hub */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            <Sparkles size={20} className={styles.sparkleIcon} />
            Không Gian Đối Soát & Đánh Giá Tuần
          </h3>
          <p className={styles.subtitle}>
            Đối chiếu báo cáo của thực tập sinh <strong>{internName}</strong> ({internCode}) với thang điểm 4 tiêu chí rubrics
          </p>
        </div>

        <div className={styles.weekSelector}>
          <label htmlFor="week-select" className={styles.weekSelectLabel}>Xem & Đánh giá:</label>
          <select
            id="week-select"
            className={styles.weekSelect}
            value={selectedWeek}
            onChange={(e) => changeWeek(Number(e.target.value))}
          >
            {Array.from({ length: 14 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Tuần {w} {w === currentWeek ? '(Hiện tại)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual-Pane Grid TM-22 */}
      <div className={styles.dualPaneGrid}>
        {/* PANEL TRÁI: ĐỐI SOÁT BÁO CÁO CỦA TTS */}
        <div className={styles.leftInspectionColumn}>
          <MentorWeeklyReportInspectionView
            report={reviewData?.report || null}
            weekNumber={selectedWeek}
            startDate={reviewData?.startDate}
            endDate={reviewData?.endDate}
            loading={reviewLoading}
            onRequestRevisionClick={() => setIsRevisionModalOpen(true)}
          />
        </div>

        {/* PANEL PHẢI: FORM CHẤM ĐIỂM & NHẬN XÉT CỦA MENTOR */}
        <div className={styles.rightEvaluationColumn}>
          {/* 4 Tiêu chí Rubrics & Thẻ Điểm TB */}
          <div className={styles.rubricsBox}>
            <div className={styles.rubricsList}>
              {renderStarSelector('1. Chuyên môn & Kỹ thuật', scores.technicalScore, (s) =>
                setScores((prev) => ({ ...prev, technicalScore: s }))
              )}
              {renderStarSelector('2. Thái độ & Tác phong', scores.attitudeScore, (s) =>
                setScores((prev) => ({ ...prev, attitudeScore: s }))
              )}
              {renderStarSelector('3. Giao tiếp & Đồng đội', scores.teamworkScore, (s) =>
                setScores((prev) => ({ ...prev, teamworkScore: s }))
              )}
              {renderStarSelector('4. Tiến độ hoàn thành', scores.productivityScore, (s) =>
                setScores((prev) => ({ ...prev, productivityScore: s }))
              )}
            </div>

            <div className={styles.averageCard}>
              <span className={styles.avgLabel}>Điểm Trung Bình</span>
              <div className={styles.avgScore}>{averageScore}</div>
              <span className={styles.avgMax}>thang điểm 5.0</span>
            </div>
          </div>

          {/* Smart Template Chips */}
          <div className={styles.smartRow}>
            <div className={styles.templateChips}>
              <span className={styles.chipHeader}>Gợi ý nhanh:</span>
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  className={styles.templateBtn}
                  onClick={() => handleApplyTemplate(tpl)}
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* AI Assistant Coming Soon */}
            <div className={styles.aiBadgeContainer}>
              <button
                type="button"
                disabled
                className={styles.aiBtnDisabled}
                title="Tính năng AI đang trong quá trình thử nghiệm"
              >
                <Sparkles size={14} /> Gợi ý AI
              </button>
              <span className={styles.comingSoonBadge}>COMING SOON</span>
            </div>
          </div>

          {/* Nhận xét & Đánh giá chi tiết */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="mentor-feedback-textarea">
              Nhận xét & Đánh giá chi tiết tuần {selectedWeek} <span className={styles.required}>*</span>
            </label>
            <textarea
              id="mentor-feedback-textarea"
              rows={4}
              className={styles.textarea}
              placeholder="Nêu rõ ưu điểm, điểm cần khắc phục, sự tiến bộ trong tuần qua..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={reviewSubmitting}
            />
          </div>

          {/* Mục tiêu tuần tới */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="mentor-goals-textarea">
              Mục tiêu & Nhiệm vụ trọng tâm tuần tới (Next-week Goals)
            </label>
            <textarea
              id="mentor-goals-textarea"
              rows={2}
              className={styles.textarea}
              placeholder="Mục tiêu cụ thể cần đạt được, task trọng tâm giao cho tuần tiếp theo..."
              value={nextWeekGoals}
              onChange={(e) => setNextWeekGoals(e.target.value)}
              disabled={reviewSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className={styles.actionBar}>
            <button
              type="button"
              disabled={reviewSubmitting || reviewLoading}
              className={styles.btnDraft}
              onClick={() => void handleSave(false)}
            >
              <Save size={16} /> Lưu Nháp
            </button>

            <button
              type="button"
              disabled={reviewSubmitting || reviewLoading}
              className={styles.btnPublish}
              onClick={() => void handleSave(true)}
            >
              <Send size={16} /> {reviewData?.assessment?.status === 'PUBLISHED' ? 'Cập Nhật Đánh Giá' : 'Gửi Đánh Giá Cho TTS'}
            </button>
          </div>
        </div>
      </div>

      {/* Lịch sử các tuần trước */}
      {historyAssessments && historyAssessments.length > 0 && (
        <div className={styles.historySection}>
          <h4 className={styles.historyTitle}>
            <History size={16} /> Lịch Sử Đánh Giá Các Tuần
          </h4>
          <div className={styles.historyList}>
            {historyAssessments.map((item) => (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.historyHeader}>
                  <div className={styles.historyWeekBlock}>
                    <span className={styles.historyWeek}>Tuần {item.weekNumber}</span>
                    <span className={styles.historyDate}>({item.assessmentDate})</span>
                    {item.status === 'PUBLISHED' ? (
                      <span className={styles.badgePublished}>
                        <CheckCircle2 size={12} /> Đã gửi TTS
                      </span>
                    ) : (
                      <span className={styles.badgeDraft}>
                        <AlertCircle size={12} /> Bản nháp
                      </span>
                    )}
                  </div>
                  <div className={styles.historyScore}>
                    ⭐ {item.averageScore.toFixed(1)}/5
                  </div>
                </div>
                <p className={styles.historyFeedback}>{item.feedback}</p>
                {item.nextWeekGoals && (
                  <p className={styles.historyGoals}>
                    🎯 <strong>Mục tiêu:</strong> {item.nextWeekGoals}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Yêu Cầu Chỉnh Sửa Báo Cáo */}
      <MentorRequestRevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        internName={internName}
        internCode={internCode}
        weekNumber={selectedWeek}
        onSubmit={handleRequestRevisionSubmit}
        loading={reviewSubmitting}
      />
    </div>
  );
};
