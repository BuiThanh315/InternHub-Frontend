import React, { useState } from 'react';
import { Star, Sparkles, Send, Save, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { WeeklyAssessment, CreateWeeklyAssessmentPayload } from '../../../types';
import styles from './MentorWeeklyEvaluationHub.module.css';

interface MentorWeeklyEvaluationHubProps {
  internCode: string;
  internName: string;
  currentWeek: number;
  historyAssessments: WeeklyAssessment[];
  onSaveAssessment: (payload: CreateWeeklyAssessmentPayload) => Promise<void>;
  loading?: boolean;
}

const TEMPLATES = [
  {
    label: '🌟 Xuất sắc (5⭐)',
    minAvg: 4.5,
    feedback: 'Tiếp thu kiến trúc rất nhanh, chủ động giải quyết vấn đề và hỗ trợ đồng đội xuất sắc. Hoàn thành task đúng và vượt tiến độ đề ra.',
    goals: 'Nghiên cứu sâu hơn về Distributed Caching (Redis), tối ưu hóa latency và chuẩn bị bài thuyết trình kỹ thuật nội bộ.',
  },
  {
    label: '👍 Đạt yêu cầu (4⭐)',
    minAvg: 3.5,
    feedback: 'Hoàn thành các đầu việc được giao đúng cam kết. Cần chủ động trao đổi sớm hơn khi gặp vướng mắc kỹ thuật phức tạp.',
    goals: 'Tăng cường viết Unit Test bao phủ các edge cases, cải thiện kỹ năng debug và refactor code sạch sẽ hơn.',
  },
  {
    label: '⚠️ Cần cải thiện (2-3⭐)',
    minAvg: 2.0,
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
  loading = false,
}) => {
  const [technicalScore, setTechnicalScore] = useState<number>(4);
  const [attitudeScore, setAttitudeScore] = useState<number>(5);
  const [teamworkScore, setTeamworkScore] = useState<number>(4);
  const [productivityScore, setProductivityScore] = useState<number>(4);

  const [feedback, setFeedback] = useState<string>('');
  const [nextWeekGoals, setNextWeekGoals] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek || 1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Tính điểm trung bình thời gian thực
  const averageScore = Number(
    ((technicalScore + attitudeScore + teamworkScore + productivityScore) / 4).toFixed(1)
  );

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

    try {
      setIsSubmitting(true);
      await onSaveAssessment({
        weekNumber: selectedWeek,
        technicalScore,
        attitudeScore,
        teamworkScore,
        productivityScore,
        feedback,
        nextWeekGoals,
        isPublish,
      });

      if (isPublish) {
        toast.success(`Đã gửi đánh giá tuần ${selectedWeek} thành công cho ${internName}!`);
      } else {
        toast.success(`Đã lưu nháp đánh giá tuần ${selectedWeek} (Chỉ lưu nội bộ).`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu đánh giá tuần');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarSelector = (
    label: string,
    score: number,
    setScore: (s: number) => void
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
              onClick={() => setScore(star)}
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
            Đánh Giá Tuần & Kế Hoạch Đồng Hành
          </h3>
          <p className={styles.subtitle}>
            Chấm điểm 4 tiêu chí chuẩn, gửi phản hồi và giao mục tiêu tuần tới cho <strong>{internName}</strong> ({internCode})
          </p>
        </div>

        <div className={styles.weekSelector}>
          <label htmlFor="week-select" className={styles.weekSelectLabel}>Đánh giá cho:</label>
          <select
            id="week-select"
            className={styles.weekSelect}
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
          >
            {Array.from({ length: 14 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Tuần {w} {w === currentWeek ? '(Hiện tại)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Tiêu chí Rubrics & Điểm TB */}
      <div className={styles.rubricsBox}>
        <div className={styles.rubricsList}>
          {renderStarSelector('1. Kỹ năng chuyên môn & Kỹ thuật', technicalScore, setTechnicalScore)}
          {renderStarSelector('2. Thái độ & Tác phong làm việc', attitudeScore, setAttitudeScore)}
          {renderStarSelector('3. Giao tiếp & Tinh thần đồng đội', teamworkScore, setTeamworkScore)}
          {renderStarSelector('4. Tiến độ hoàn thành công việc', productivityScore, setProductivityScore)}
        </div>

        <div className={styles.averageCard}>
          <span className={styles.avgLabel}>Điểm Trung Bình</span>
          <div className={styles.avgScore}>{averageScore}</div>
          <span className={styles.avgMax}>thang điểm 5.0</span>
        </div>
      </div>

      {/* Smart Template Chips & AI Badge */}
      <div className={styles.smartRow}>
        <div className={styles.templateChips}>
          <span className={styles.chipHeader}>Gợi ý mẫu:</span>
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

        {/* Nút AI Coming Soon */}
        <div className={styles.aiBadgeContainer}>
          <button
            type="button"
            disabled
            className={styles.aiBtnDisabled}
            title="Tính năng AI đang trong quá trình thử nghiệm"
          >
            <Sparkles size={14} /> Gợi ý nhận xét AI
          </button>
          <span className={styles.comingSoonBadge}>COMING SOON</span>
        </div>
      </div>

      {/* Inputs Form */}
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>
          Nhận xét & Đánh giá chi tiết tuần {selectedWeek} <span className={styles.required}>*</span>
        </label>
        <textarea
          rows={3}
          className={styles.textarea}
          placeholder="Nêu rõ ưu điểm, điểm cần khắc phục, sự tiến bộ trong tuần qua..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>
          Mục tiêu & Nhiệm vụ trọng tâm tuần tới (Next-week Goals)
        </label>
        <textarea
          rows={2}
          className={styles.textarea}
          placeholder="Mục tiêu cụ thể cần đạt được, task trọng tâm giao cho tuần tiếp theo..."
          value={nextWeekGoals}
          onChange={(e) => setNextWeekGoals(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className={styles.actionBar}>
        <button
          type="button"
          disabled={isSubmitting || loading}
          className={styles.btnDraft}
          onClick={() => handleSave(false)}
        >
          <Save size={16} /> Lưu Nháp (Chỉ Mentor)
        </button>

        <button
          type="button"
          disabled={isSubmitting || loading}
          className={styles.btnPublish}
          onClick={() => handleSave(true)}
        >
          <Send size={16} /> Gửi Đánh Giá Cho TTS
        </button>
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
    </div>
  );
};
