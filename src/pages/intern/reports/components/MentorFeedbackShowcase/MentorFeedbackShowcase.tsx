import React from 'react';
import { Star, Clock, Award } from 'lucide-react';
import { formatDateTime } from '../../../../../utils/formatters';
import type { MentorFeedbackShowcaseProps } from './MentorFeedbackShowcase.types';
import styles from './MentorFeedbackShowcase.module.css';

export const MentorFeedbackShowcase: React.FC<MentorFeedbackShowcaseProps> = ({
  mentorName,
  mentorScore,
  mentorFeedback,
  reviewedAt,
  onViewDetails,
}) => {
  if (!mentorFeedback && mentorScore === null && mentorScore === undefined) {
    return null;
  }

  const initial = mentorName ? mentorName.trim().charAt(0).toUpperCase() : 'M';

  return (
    <section className={styles.showcaseCard} aria-label="Đánh giá từ người hướng dẫn">
      <div className={styles.headerRow}>
        <div className={styles.mentorMeta}>
          <div className={styles.avatarCircle}>
            {initial}
          </div>
          <div className={styles.mentorInfo}>
            <span className={styles.mentorLabel}>Người hướng dẫn (Mentor)</span>
            <span className={styles.mentorName}>
              {mentorName || 'Mentor phụ trách'}
            </span>
          </div>
        </div>

        {mentorScore !== null && mentorScore !== undefined && (
          <div className={styles.scorePill}>
            <Star size={15} fill="currentColor" />
            <span>Điểm đánh giá: {mentorScore} / 5.0</span>
          </div>
        )}
      </div>

      {mentorFeedback && (
        <div className={styles.feedbackContent}>
          {mentorFeedback}
        </div>
      )}

      <div className={styles.footerRow}>
        {reviewedAt ? (
          <div className={styles.reviewedTime}>
            <Clock size={13} />
            <span>Thời điểm công bố: {formatDateTime(reviewedAt)}</span>
          </div>
        ) : <div />}

        {onViewDetails && (
          <button
            type="button"
            className={styles.viewDetailBtn}
            onClick={onViewDetails}
          >
            <Award size={15} />
            <span>Xem chi tiết bảng đánh giá Rubrics</span>
          </button>
        )}
      </div>
    </section>
  );
};
