import React from 'react';
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

  return (
    <div className={`${styles.card} ${cardStatusClass} ${className}`}>
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

        {/* Transition Buttons */}
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
      </div>
    </div>
  );
};

export default InternTaskCard;
