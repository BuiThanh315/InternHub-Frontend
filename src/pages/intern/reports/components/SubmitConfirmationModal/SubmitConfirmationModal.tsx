import React from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Modal, Button } from '../../../../../components/common';
import type { SubmitConfirmationModalProps } from './SubmitConfirmationModal.types';
import styles from './SubmitConfirmationModal.module.css';

export const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  weekNumber,
  isAlreadySubmitted = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAlreadySubmitted ? `Cập Nhật Báo Cáo Tuần ${weekNumber}` : `Xác Nhận Nộp Báo Cáo Tuần ${weekNumber}`}
      footer={
        <div className={styles.footerButtons}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Quay lại chỉnh sửa
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            <Send size={14} className={isSubmitting ? 'animate-spin' : ''} />
            <span>
              {isSubmitting
                ? 'Đang gửi...'
                : isAlreadySubmitted
                ? 'Cập nhật và gửi lại'
                : 'Xác nhận nộp báo cáo'}
            </span>
          </Button>
        </div>
      }
    >
      <div className={styles.modalBody}>
        <div className={styles.warningBanner}>
          <CheckCircle2 size={20} className={styles.warningIcon} />
          <div>
            <strong>Bạn đang chuẩn bị nộp báo cáo cho Tuần {weekNumber}.</strong>
            <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
              Sau khi nộp, Người hướng dẫn (Mentor) sẽ nhận được thông báo thời gian thực để tiến hành đánh giá và cho điểm.
            </p>
          </div>
        </div>

        <ul className={styles.guidelinesList}>
          <li>
            Báo cáo sẽ chuyển sang trạng thái <strong>ĐÃ NỘP (SUBMITTED)</strong>.
          </li>
          <li>
            Bạn vẫn có thể cập nhật lại nội dung nếu cần, <em>trừ khi</em> Mentor đã công bố điểm đánh giá chính thức.
          </li>
          <li>
            Hãy đảm bảo bạn đã điền đầy đủ và trung thực về các nhiệm vụ đã làm, khó khăn và bài học mới.
          </li>
        </ul>
      </div>
    </Modal>
  );
};
