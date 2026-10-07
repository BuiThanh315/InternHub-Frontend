import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Compass,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { Modal, Button } from '../../../../../components/common';
import { formatDateTime } from '../../../../../utils/formatters';
import type { MentorAssessmentDetailModalProps } from './MentorAssessmentDetailModal.types';
import styles from './MentorAssessmentDetailModal.module.css';

export const MentorAssessmentDetailModal: React.FC<MentorAssessmentDetailModalProps> = ({
  isOpen,
  onClose,
  weekNumber,
  assessment,
  fallbackScore,
  fallbackFeedback,
  fallbackMentorName,
  fallbackReviewedAt,
}) => {
  // Lấy dữ liệu điểm và nhận xét (ưu tiên từ assessment object, fallback sang các props phụ)
  const averageScore = assessment?.averageScore ?? fallbackScore ?? null;
  const feedback = assessment?.feedback || fallbackFeedback || '';
  const nextWeekGoals = assessment?.nextWeekGoals || '';
  const mentorName = assessment?.mentorName || fallbackMentorName || 'Mentor phụ trách';
  const publishedAt = assessment?.publishedAt || fallbackReviewedAt || null;

  const technicalScore = assessment?.technicalScore ?? null;
  const attitudeScore = assessment?.attitudeScore ?? null;
  const teamworkScore = assessment?.teamworkScore ?? null;
  const productivityScore = assessment?.productivityScore ?? null;

  // Xếp loại dựa trên điểm trung bình
  const getTierInfo = (score: number | null) => {
    if (score === null) return { label: 'Chưa xếp loại', className: styles.tierAverage };
    if (score >= 4.5) return { label: 'Xuất sắc', className: styles.tierExcellent };
    if (score >= 3.5) return { label: 'Tốt', className: styles.tierGood };
    if (score >= 2.5) return { label: 'Khá', className: styles.tierAverage };
    return { label: 'Cần nỗ lực hơn', className: styles.tierNeedsImprovement };
  };

  const tier = getTierInfo(averageScore);

  const initial = mentorName.trim().charAt(0).toUpperCase();

  const renderStars = (score: number | null) => {
    const rounded = score ? Math.round(score) : 0;
    return (
      <div className={styles.starRow} aria-label={`Đánh giá ${score ?? 0} trên 5 sao`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            fill={star <= rounded ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        ))}
      </div>
    );
  };

  const rubrics = [
    {
      id: 'tech',
      name: 'Chuyên môn & Kỹ thuật',
      icon: <Wrench size={16} className={styles.rubricIcon} />,
      score: technicalScore,
    },
    {
      id: 'attitude',
      name: 'Thái độ & Tác phong',
      icon: <Sparkles size={16} className={styles.rubricIcon} />,
      score: attitudeScore,
    },
    {
      id: 'teamwork',
      name: 'Giao tiếp & Đồng đội',
      icon: <Users size={16} className={styles.rubricIcon} />,
      score: teamworkScore,
    },
    {
      id: 'productivity',
      name: 'Tiến độ & Năng suất',
      icon: <Zap size={16} className={styles.rubricIcon} />,
      score: productivityScore,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bảng Đánh Giá & Phản Hồi Báo Cáo Tuần ${weekNumber}`}
      size="lg"
      footer={
        <div className={styles.modalFooterActions}>
          <Button variant="primary" size="md" onClick={onClose}>
            Đã hiểu & Đóng
          </Button>
        </div>
      }
    >
      <div className={styles.modalContainer}>
        {/* 1. Header Meta Bar */}
        <div className={styles.metaHeader}>
          <div className={styles.mentorInfoGroup}>
            <div className={styles.mentorAvatar}>{initial}</div>
            <div className={styles.mentorText}>
              <span className={styles.mentorRole}>Người hướng dẫn trực tiếp</span>
              <span className={styles.mentorName}>{mentorName}</span>
            </div>
          </div>

          <div className={styles.publishStatus}>
            <span className={styles.publishedBadge}>
              <CheckCircle2 size={13} />
              <span>Đã công bố kết quả</span>
            </span>
            {publishedAt && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} />
                <span>{formatDateTime(publishedAt)}</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Hero Score Card */}
        <div className={styles.heroScoreCard}>
          <div className={styles.scoreLeft}>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreValue}>
                {averageScore !== null ? Number(averageScore).toFixed(1) : '--'}
              </span>
              <span className={styles.scoreMax}>/ 5.0</span>
            </div>
            <div className={styles.scoreMeta}>
              <span className={styles.scoreLabel}>Điểm Trung Bình Đánh Giá Tuần</span>
              <div className={styles.ratingTier}>{renderStars(averageScore)}</div>
            </div>
          </div>

          <div className={`${styles.scoreBadgeTier} ${tier.className}`}>
            <span>Xếp loại: {tier.label}</span>
          </div>
        </div>

        {/* 3. Rubrics 4 Tiêu Chí (Chuyên môn, Thái độ, Đồng đội, Năng suất) */}
        {(technicalScore !== null ||
          attitudeScore !== null ||
          teamworkScore !== null ||
          productivityScore !== null) && (
          <section className={styles.rubricsSection} aria-label="Chi tiết điểm 4 tiêu chí">
            <h4 className={styles.sectionTitle}>
              <Award size={16} style={{ color: 'var(--primary, #3b82f6)' }} />
              <span>Điểm Số Chi Tiết Theo 4 Tiêu Chí Chuẩn (Rubrics)</span>
            </h4>

            <div className={styles.rubricsGrid}>
              {rubrics.map((r) => {
                const percent = r.score !== null ? Math.min(100, Math.max(0, (r.score / 5) * 100)) : 0;
                return (
                  <div key={r.id} className={styles.rubricCard}>
                    <div className={styles.rubricHeader}>
                      <div className={styles.rubricNameGroup}>
                        {r.icon}
                        <span className={styles.rubricName}>{r.name}</span>
                      </div>
                      <span className={styles.rubricScoreTag}>
                        {r.score !== null ? `${r.score} / 5` : '—'}
                      </span>
                    </div>

                    <div className={styles.progressBarTrack}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className={styles.rubricFooter}>
                      <span>Thang điểm 5.0</span>
                      <span>{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Nhận xét & Đánh giá chi tiết */}
        {feedback && (
          <section className={styles.feedbackSection} aria-label="Nhận xét của Mentor">
            <h4 className={styles.sectionTitle}>
              <MessageSquare size={16} style={{ color: 'var(--primary, #3b82f6)' }} />
              <span>Nhận Xét & Góp Ý Chuyên Môn Của Mentor</span>
            </h4>
            <div className={styles.feedbackBox}>
              {feedback}
            </div>
          </section>
        )}

        {/* 5. Mục tiêu & Định hướng tuần tới */}
        {nextWeekGoals && (
          <section className={styles.goalsSection} aria-label="Mục tiêu tuần tới">
            <h4 className={styles.goalsTitle}>
              <Compass size={16} />
              <span>Mục Tiêu & Định Hướng Tập Trung Tuần Tới</span>
            </h4>
            <div className={styles.goalsContent}>
              {nextWeekGoals}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
};

export default MentorAssessmentDetailModal;
