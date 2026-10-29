import React, { useState } from 'react';
import {
  Clock,
  Edit3,
  Trash2,
  AlertCircle,
  Sparkles,
  Eye,
} from 'lucide-react';
import { AssigneeAvatarStack } from '../AssigneeAvatarStack';
import { formatDate } from '../../../../../utils/formatters';
import type { MissionCardProps } from './MissionCard.types';
import styles from './MissionCard.module.css';

export const MissionCard: React.FC<MissionCardProps> = ({
  item,
  presence,
  onEdit,
  onDelete,
  onStatusChange: _onStatusChange,
  onViewQuizDetail,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const isQuizTask = Boolean(
    (item.submissionUrl && item.submissionUrl.includes('/quizzes/')) ||
    item.title.startsWith('[Quiz]') ||
    item.title.startsWith('[Quiz AI]')
  );

  // Tính toán hạn chót: bình thường, khẩn cấp (<= 2 ngày) hoặc quá hạn
  const getDueDateStatus = () => {
    if (!item.dueDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Quá hạn: ${formatDate(item.dueDate)}`, isOverdue: true, isUrgent: false };
    }
    if (diffDays <= 2) {
      return { label: `Hạn: ${formatDate(item.dueDate)}`, isOverdue: false, isUrgent: true };
    }
    return { label: `Hạn: ${formatDate(item.dueDate)}`, isOverdue: false, isUrgent: false };
  };

  const dueInfo = getDueDateStatus();

  // Nhãn & class độ ưu tiên
  const priorityConfig = {
    HIGH: { label: 'Ưu tiên cao', class: styles.priorityHigh },
    MEDIUM: { label: 'Trung bình', class: styles.priorityMedium },
    LOW: { label: 'Thấp', class: styles.priorityLow },
  }[item.priority];

  const getDueDateVariantClass = () => {
    if (!dueInfo) return '';
    if (dueInfo.isOverdue) return styles.dueDateOverdue;
    if (dueInfo.isUrgent) return styles.dueDateUrgent;
    return '';
  };

  // Class viền thẻ theo trạng thái
  const cardStatusClass = {
    TODO: styles.cardTodo,
    IN_PROGRESS: styles.cardInProgress,
    COMPLETED: styles.cardCompleted,
  }[item.status];

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', String(item.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`${styles.card} ${cardStatusClass} ${isDragging ? styles.cardDragging : ''} ${className}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Realtime Actor Presence Badge */}
      {presence && (
        <div className={styles.actorPresenceBadge} title={presence.actionText}>
          <span>👤</span>
          <span>{presence.actorName} {presence.actionText}</span>
        </div>
      )}

      {/* Header: Priority Badge & Action Buttons */}
      <div className={styles.cardHeader}>
        <span className={`${styles.priorityBadge} ${priorityConfig.class}`}>
          {priorityConfig.label}
        </span>
        <div className={styles.actionButtonGroup}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onEdit(item)}
            title="Chỉnh sửa công việc"
            aria-label="Chỉnh sửa công việc"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            onClick={() => onDelete(item)}
            title="Xóa công việc"
            aria-label="Xóa công việc"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body: Title & Description */}
      <div className={styles.cardBody}>
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
      </div>

      {/* Phân hệ Quiz AI trên thẻ Kanban TM-104 */}
      {isQuizTask && (
        <div className={styles.quizCardSection}>
          <span className={styles.quizAiBadge}>
            <Sparkles size={11} /> Quiz AI
          </span>
          {onViewQuizDetail && (
            <button
              type="button"
              className={styles.quizInspectBtn}
              onClick={(e) => {
                e.stopPropagation();
                onViewQuizDetail(item);
              }}
              title="Xem các câu hỏi và đối chiếu ý tưởng đề thi với bối cảnh dự án"
            >
              <Eye size={12} /> Xem Đề Thi & Đánh Giá
            </button>
          )}
        </div>
      )}

      {/* Footer: Due date & Assignees */}
      <div className={styles.cardFooter}>
        {dueInfo ? (
          <span className={`${styles.dueDateBadge} ${getDueDateVariantClass()}`}>
            {dueInfo.isOverdue ? <AlertCircle size={13} /> : <Clock size={13} />}
            {dueInfo.label}
          </span>
        ) : (
          <span className={styles.dueDateBadge}>Không thời hạn</span>
        )}

        {/* Danh sách TTS được gán */}
        <AssigneeAvatarStack assignees={item.assignees} size="sm" maxVisible={3} />
      </div>
    </div>
  );
};

export default MissionCard;
