import React from 'react';
import { AlertTriangle, CheckCircle2, Flag, Clock, X, Send } from 'lucide-react';
import { Button } from '../../../../../../components/common';
import styles from './SubmitConfirmModal.module.css';

export interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  flaggedCount?: number;
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
  flaggedCount = 0,
  timeLeftFormatted,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const percentComplete = Math.round((answeredCount / (totalQuestions || 1)) * 100);

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconWrapper}>
              <CheckCircle2 size={22} className="text-primary" />
            </div>
            <div>
              <h3 className={styles.headerTitle}>Xác Nhận Nộp Bài Thi</h3>
              <p className={styles.headerSubtitle}>
                Kiểm tra lại tiến độ làm bài trước khi gửi kết quả chấm điểm
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Progress Bar */}
          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span>Tiến độ hoàn thành</span>
              <strong>{percentComplete}%</strong>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${percentComplete}%`,
                  background:
                    percentComplete === 100
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : 'linear-gradient(90deg, var(--primary), #8b5cf6)',
                }}
              />
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: 'var(--primary)' }}>
                {answeredCount} <span className={styles.statTotal}>/ {totalQuestions}</span>
              </div>
              <span className={styles.statLabel}>Câu đã làm</span>
            </div>

            <div className={styles.statBox}>
              <div
                className={styles.statNum}
                style={{ color: flaggedCount > 0 ? '#f59e0b' : 'var(--text-secondary)' }}
              >
                <Flag size={16} className="inline mr-1" />
                {flaggedCount}
              </div>
              <span className={styles.statLabel}>Đang gắn cờ 🚩</span>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: 'var(--text-main)' }}>
                <Clock size={16} className="inline mr-1 text-sky-500" />
                {timeLeftFormatted}
              </div>
              <span className={styles.statLabel}>Thời gian còn lại</span>
            </div>
          </div>

          {/* Notices */}
          {unansweredCount > 0 && (
            <div className={styles.warningAlert}>
              <AlertTriangle size={20} className={styles.alertIcon} />
              <div className={styles.alertText}>
                <strong>Bạn còn {unansweredCount} câu chưa trả lời!</strong>
                <p>
                  Các câu chưa làm sẽ tự động bị tính là 0 điểm. Nếu còn thời gian, hãy quay lại hoàn thành để đạt kết quả tốt nhất.
                </p>
              </div>
            </div>
          )}

          {unansweredCount === 0 && flaggedCount > 0 && (
            <div className={styles.flagNotice}>
              <Flag size={20} className={styles.flagIcon} />
              <div className={styles.alertText}>
                <strong>Bạn có {flaggedCount} câu đang gắn cờ xem lại.</strong>
                <p>
                  Bạn đã trả lời hết các câu nhưng có thể muốn rà soát lại những câu đã gắn cờ trước khi nộp.
                </p>
              </div>
            </div>
          )}

          {unansweredCount === 0 && flaggedCount === 0 && (
            <div className={styles.successNotice}>
              <CheckCircle2 size={22} className={styles.successIcon} />
              <div className={styles.alertText}>
                <strong>Sẵn sàng nộp bài!</strong>
                <p>
                  Bạn đã hoàn tất trả lời cả {totalQuestions} câu hỏi và không còn câu nào nghi vấn. Hệ thống sẽ chấm điểm tức thì ngay sau khi bạn nộp.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className={styles.resumeBtn}
          >
            Quay lại làm tiếp
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={styles.confirmBtn}
          >
            <Send size={15} />
            {isSubmitting ? 'Đang gửi bài thi...' : 'Xác nhận nộp bài'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmModal;
