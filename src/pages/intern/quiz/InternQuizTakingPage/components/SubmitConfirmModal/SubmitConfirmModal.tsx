import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Button } from '../../../../../../components/common';
import styles from './SubmitConfirmModal.module.css';

export interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  timeLeftFormatted: string;
  isSubmitting: boolean;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  unansweredCount,
  timeLeftFormatted,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.headerTitle}>
            <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} /> Xác Nhận Nộp Bài Thi
          </h3>
          <button
            type="button"
            className="iconButton"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statNum} style={{ color: 'var(--primary)' }}>
                {answeredCount} / {totalQuestions}
              </span>
              <span className={styles.statLabel}>Câu đã trả lời</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum} style={{ color: 'var(--text-main)' }}>
                {timeLeftFormatted}
              </span>
              <span className={styles.statLabel}>Thời gian còn lại</span>
            </div>
          </div>

          {unansweredCount > 0 ? (
            <div className={styles.warningAlert}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Cảnh báo:</strong> Bạn còn{' '}
                <span style={{ fontWeight: 700 }}>{unansweredCount} câu</span> chưa được trả lời.
                Hệ thống sẽ tính 0 điểm cho những câu này nếu bạn nộp bài ngay bây giờ!
              </div>
            </div>
          ) : (
            <div className={styles.successNotice}>
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
              <div>
                Tuyệt vời! Bạn đã hoàn thành câu trả lời cho toàn bộ{' '}
                <strong>{totalQuestions} câu hỏi</strong>. Bạn có muốn nộp bài để chấm điểm ngay?
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Tiếp tục làm bài
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài ngay'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmModal;
