import React from 'react';
import {
  Clock,
  AlertCircle,
  FolderGit2,
  Users,
  ExternalLink,
  CheckCircle2,
  PlayCircle,
  Circle,
  FileText,
} from 'lucide-react';

import { Modal, Button } from '../../../../../components/common';
import { formatDate, formatDateTime } from '../../../../../utils/formatters';
import type { TaskDetailModalProps } from './TaskDetailModal.types';
import styles from './TaskDetailModal.module.css';

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onStartProgress,
  onOpenSubmission,
  onReopen,
}) => {
  if (!item) return null;

  // Deadline calculation
  const getDueDateInfo = () => {
    if (!item.dueDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Quá hạn ${Math.abs(diffDays)} ngày (${formatDate(item.dueDate)})`,
        className: styles.dueOverdue,
        isOverdue: true,
      };
    }
    if (diffDays <= 2) {
      return {
        label: `Khẩn cấp: Còn ${diffDays} ngày (${formatDate(item.dueDate)})`,
        className: styles.dueUrgent,
        isOverdue: false,
      };
    }
    return {
      label: formatDate(item.dueDate),
      className: styles.dueNormal,
      isOverdue: false,
    };
  };

  const dueInfo = getDueDateInfo();

  // Priority config
  const priorityConfig = {
    HIGH: { label: 'Ưu tiên cao', class: styles.priorityHigh },
    MEDIUM: { label: 'Trung bình', class: styles.priorityMedium },
    LOW: { label: 'Thấp', class: styles.priorityLow },
  }[item.priority];

  // Status icon and label
  const statusConfig = {
    TODO: { label: 'Chưa làm', icon: Circle, color: 'var(--text-muted)' },
    IN_PROGRESS: { label: 'Đang làm', icon: PlayCircle, color: 'var(--info)' },
    COMPLETED: { label: 'Hoàn thiện', icon: CheckCircle2, color: 'var(--success)' },
  }[item.status];

  const StatusIcon = statusConfig.icon;

  const modalFooter = (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="outline" onClick={onClose}>
        Đóng
      </Button>

      {item.status === 'TODO' && onStartProgress && (
        <Button
          variant="primary"
          onClick={() => {
            onClose();
            onStartProgress(item);
          }}
        >
          <PlayCircle size={16} /> Bắt đầu làm việc
        </Button>
      )}

      {item.status === 'IN_PROGRESS' && onOpenSubmission && (
        <Button
          variant="primary"
          style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
          onClick={() => {
            onClose();
            onOpenSubmission(item);
          }}
        >
          <CheckCircle2 size={16} /> Hoàn thành & Nộp bài
        </Button>
      )}

      {item.status === 'COMPLETED' && onReopen && (
        <Button
          variant="outline"
          onClick={() => {
            onClose();
            onReopen(item);
          }}
        >
          Mở lại công việc
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <StatusIcon size={20} style={{ color: statusConfig.color }} />
          <span>{item.title}</span>
        </div>
      }
      footer={modalFooter}
      size="lg"
    >
      <div className={styles.container}>
        {/* Meta Grid */}
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Bảng nhiệm vụ</span>
            <span className={styles.metaValue}>
              <FolderGit2 size={15} style={{ color: 'var(--primary)' }} />
              {item.boardTitle || 'Bảng chung'}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Mức độ ưu tiên</span>
            <div className={styles.metaValue}>
              <span className={`${styles.priorityBadge} ${priorityConfig.class}`}>
                {priorityConfig.label}
              </span>
            </div>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Hạn chót</span>
            <span className={`${styles.metaValue} ${dueInfo?.className || ''}`}>
              {dueInfo?.isOverdue ? <AlertCircle size={15} /> : <Clock size={15} />}
              {dueInfo ? dueInfo.label : 'Không thời hạn'}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Ngày giao việc</span>
            <span className={styles.metaValue}>
              {item.createdAt ? formatDate(item.createdAt) : 'Không xác định'}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            <FileText size={16} /> Yêu cầu chi tiết từ Mentor
          </h4>
          <div className={styles.descriptionBox}>
            {item.description ? (
              item.description
            ) : (
              <span className={styles.emptyDesc}>Mentor không để lại mô tả bổ sung cho mục này.</span>
            )}
          </div>
        </div>

        {/* Assignees Section */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            <Users size={16} /> Đồng đội cùng thực hiện ({item.assignees?.length || 0})
          </h4>
          <div className={styles.assigneesList}>
            {item.assignees && item.assignees.length > 0 ? (
              item.assignees.map((assignee) => (
                <div key={assignee.id} className={styles.assigneeRow}>
                  <img
                    src={
                      assignee.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        assignee.fullName || 'TTS'
                      )}&background=4f46e5&color=fff`
                    }
                    alt={assignee.fullName}
                    className={styles.assigneeAvatar}
                  />
                  <div className={styles.assigneeInfo}>
                    <span className={styles.assigneeName}>{assignee.fullName}</span>
                    <span className={styles.assigneeCode}>
                      {assignee.internCode} • {assignee.email}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <span className={styles.emptyDesc}>Chưa có thông tin phân công.</span>
            )}
          </div>
        </div>

        {/* Completed Submission Details */}
        {item.status === 'COMPLETED' && (item.submissionUrl || item.completionNote) && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Kết quả nộp bài
            </h4>
            <div className={styles.submissionBox}>
              {item.submissionUrl && (
                <a
                  href={item.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.submissionLink}
                >
                  <ExternalLink size={15} />
                  <span>{item.submissionUrl}</span>
                </a>
              )}

              {item.completionNote && (
                <p className={styles.submissionNote}>
                  <strong>Ghi chú:</strong> {item.completionNote}
                </p>
              )}

              {item.submittedAt && (
                <span className={styles.submittedTime}>
                  Đã nộp vào: {formatDateTime(item.submittedAt)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
