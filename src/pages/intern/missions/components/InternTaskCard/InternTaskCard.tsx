import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  PlayCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FolderGit2,
  ExternalLink,
  Info,
  Sparkles,
  Award,
} from 'lucide-react';

import { AssigneeAvatarStack } from '../../../../mentor/missions/components/AssigneeAvatarStack';
import { formatDate } from '../../../../../utils/formatters';
import type { InternTaskCardProps } from './InternTaskCard.types';
import styles from './InternTaskCard.module.css';

export const InternTaskCard: React.FC<InternTaskCardProps> = ({
  item,
  onViewDetail,
  onStatusChange,
  onOpenSubmissionModal,
  isMutating = false,
  className = '',
}) => {
  const navigate = useNavigate();

  // Due date status
  const getDueDateStatus = () => {
    if (!item.dueDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Quá hạn: ${formatDate(item.dueDate)}`,
        className: styles.dueDateOverdue,
        isOverdue: true,
      };
    }
    if (diffDays <= 2) {
      return {
        label: `Hạn: ${formatDate(item.dueDate)}`,
        className: styles.dueDateUrgent,
        isOverdue: false,
      };
    }
    return {
      label: `Hạn: ${formatDate(item.dueDate)}`,
      className: '',
      isOverdue: false,
    };
  };

  const dueInfo = getDueDateStatus();

  // Priority config
  const priorityConfig = {
    HIGH: { label: 'Ưu tiên cao', class: styles.priorityHigh },
    MEDIUM: { label: 'Trung bình', class: styles.priorityMedium },
    LOW: { label: 'Thấp', class: styles.priorityLow },
  }[item.priority];

  // Status-based card border
  const cardStatusClass = {
    TODO: styles.cardTodo,
    IN_PROGRESS: styles.cardInProgress,
    COMPLETED: styles.cardCompleted,
  }[item.status];

  // Check if this task is an AI Quiz task
  const isQuizTask =
    item.title.startsWith('[Quiz]') ||
    item.title.toLowerCase().includes('quiz') ||
    Boolean(item.submissionUrl && item.submissionUrl.includes('/quizzes/'));

  const getQuizTakeUrl = () => {
    if (item.submissionUrl && item.submissionUrl.includes('/intern/quizzes/')) {
      if (item.submissionUrl.endsWith('/take')) return item.submissionUrl;
      return `${item.submissionUrl}/take`;
    }
    const match = item.submissionUrl?.match(/\/intern\/quizzes\/(\d+)/);
    if (match) return `/intern/quizzes/${match[1]}/take`;
    return '/intern/quizzes';
  };

  return (
    <div className={`${styles.card} ${cardStatusClass} ${isQuizTask ? styles.cardQuiz : ''} ${className}`}>
      {/* Quiz Banner Badge if it's a quiz */}
      {isQuizTask && (
        <div className={styles.quizBadge}>
          <Sparkles size={12} className="text-amber-500 shrink-0" />
          <span>Bài Kiểm Tra Ôn Tập AI</span>
        </div>
      )}

      {/* Header: Priority Badge & Deadline */}
      <div className={styles.cardHeader}>
        <span className={`${styles.priorityBadge} ${priorityConfig.class}`}>
          {priorityConfig.label}
        </span>

        {dueInfo ? (
          <span className={`${styles.dueDateBadge} ${dueInfo.className}`}>
            {dueInfo.isOverdue ? <AlertCircle size={13} /> : <Clock size={13} />}
            <span>{dueInfo.label}</span>
          </span>
        ) : (
          <span className={styles.dueDateBadge}>Không thời hạn</span>
        )}
      </div>

      {/* Body: Title, Description & Board Tag */}
      <div className={styles.cardBody} onClick={() => onViewDetail(item)}>
        <h4
          className={`${styles.cardTitle} ${
            item.status === 'COMPLETED' ? styles.cardTitleCompleted : ''
          }`}
        >
          {item.title}
        </h4>

        {item.description && (
          <p className={styles.cardDescription}>{item.description}</p>
        )}

        {item.boardTitle && (
          <span className={styles.boardTag}>
            <FolderGit2 size={12} />
            <span>{item.boardTitle}</span>
          </span>
        )}
      </div>

      {/* Footer: Assignees Stack & Submission Chip */}
      <div className={styles.cardFooter}>
        <AssigneeAvatarStack assignees={item.assignees} size="sm" maxVisible={3} />

        {item.status === 'COMPLETED' && item.submissionUrl && (
          <a
            href={item.submissionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.submissionChip}
            title={item.submissionUrl}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={11} />
            <span>Sản phẩm</span>
          </a>
        )}
      </div>

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnDetail}`}
          onClick={() => onViewDetail(item)}
          title="Xem chi tiết yêu cầu"
          aria-label="Xem chi tiết yêu cầu"
        >
          <Info size={13} />
          <span>Chi tiết</span>
        </button>

        {/* If it's a Quiz Task: Provide direct Quiz actions */}
        {isQuizTask ? (
          item.status !== 'COMPLETED' ? (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnTakeQuiz}`}
              onClick={(e) => {
                e.stopPropagation();
                if (item.status === 'TODO') {
                  onStatusChange(item.id, 'IN_PROGRESS');
                }
                navigate(getQuizTakeUrl());
              }}
              disabled={isMutating}
              title="Bắt đầu làm bài thi trắc nghiệm trực tuyến"
            >
              <Sparkles size={13} />
              <span>Làm bài Quiz</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnViewResult}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.submissionUrl || '/intern/quizzes');
              }}
              title="Xem lại kết quả & điểm số bài thi"
            >
              <Award size={13} />
              <span>Xem kết quả</span>
            </button>
          )
        ) : (
          /* Standard Transition Buttons for Regular Tasks */
          <>
            {item.status === 'TODO' && (
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnStart}`}
                onClick={() => onStatusChange(item.id, 'IN_PROGRESS')}
                disabled={isMutating}
                title="Bắt đầu thực hiện nhiệm vụ"
              >
                <PlayCircle size={13} />
                <span>Bắt đầu làm</span>
                <ArrowRight size={13} />
              </button>
            )}

            {item.status === 'IN_PROGRESS' && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => onStatusChange(item.id, 'TODO')}
                  disabled={isMutating}
                  title="Lùi lại Chưa làm"
                >
                  <RotateCcw size={12} />
                  <span>Chưa làm</span>
                </button>

                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionBtnComplete}`}
                  onClick={() => onOpenSubmissionModal(item)}
                  disabled={isMutating}
                  title="Hoàn thành & Nộp bài"
                >
                  <CheckCircle2 size={13} />
                  <span>Hoàn thành</span>
                </button>
              </div>
            )}

            {item.status === 'COMPLETED' && (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => onStatusChange(item.id, 'IN_PROGRESS')}
                disabled={isMutating}
                title="Mở lại công việc để chỉnh sửa tiếp"
              >
                <RotateCcw size={13} />
                <span>Mở lại làm tiếp</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InternTaskCard;
