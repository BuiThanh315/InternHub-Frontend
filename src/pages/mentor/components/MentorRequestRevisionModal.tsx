import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { Modal } from '../../../components/common/Modal/Modal';
import { Button } from '../../../components/common/Button/Button';
import type { MentorRequestRevisionModalProps } from './MentorRequestRevisionModal.types';
import styles from './MentorRequestRevisionModal.module.css';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export const MentorRequestRevisionModal: React.FC<MentorRequestRevisionModalProps> = ({
  isOpen,
  onClose,
  internName,
  internCode,
  weekNumber,
  onSubmit,
  loading = false,
}) => {
  const [revisionNote, setRevisionNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRevisionNote('');
      setValidationError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const trimmed = revisionNote.trim();
    if (!trimmed) {
      setValidationError('Vui lòng nhập lý do và hướng dẫn chỉnh sửa.');
      return;
    }
    if (trimmed.length < MIN_LENGTH) {
      setValidationError(`Lý do yêu cầu làm lại phải có ít nhất ${MIN_LENGTH} ký tự.`);
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setValidationError(`Lý do không được vượt quá ${MAX_LENGTH} ký tự.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError(null);
      await onSubmit(trimmed);
      onClose();
    } catch {
      // Giữ nguyên modal và form khi có lỗi phát sinh (Rule 24)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const footer = (
    <div className={styles.modalFooter}>
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={isSubmitting || loading}
      >
        Hủy Bỏ
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        isLoading={isSubmitting || loading}
        disabled={isSubmitting || loading}
      >
        <Send size={15} /> Gửi Yêu Cầu Chỉnh Sửa
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Yêu Cầu Chỉnh Sửa Báo Cáo Tuần ${weekNumber}`}
      footer={footer}
      size="md"
    >
      <div className={styles.modalBody}>
        {/* Thông tin TTS */}
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '-4px' }}>
          Thực tập sinh: <strong>{internName}</strong> ({internCode})
        </div>

        {/* Banner cảnh báo */}
        <div className={styles.warningBox}>
          <AlertTriangle size={18} className={styles.warningIcon} />
          <div>
            Báo cáo sẽ được chuyển về trạng thái <strong>Cần chỉnh sửa</strong>. Thực tập sinh sẽ nhận được thông báo kèm nội dung hướng dẫn bên dưới để bổ sung và nộp lại.
          </div>
        </div>

        {/* Ô nhập lý do */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="revision-note-textarea">
            <span>
              Lý do & Hướng dẫn cụ thể <span className={styles.required}>*</span>
            </span>
            <span className={styles.charCount}>
              {revisionNote.length}/{MAX_LENGTH}
            </span>
          </label>
          <textarea
            id="revision-note-textarea"
            className={`${styles.textarea} ${validationError ? styles.textareaError : ''}`}
            placeholder="Nêu rõ nội dung cần bổ sung, minh chứng còn thiếu hoặc lý do chưa đạt yêu cầu (tối thiểu 10 ký tự)..."
            value={revisionNote}
            onChange={(e) => {
              setRevisionNote(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            disabled={isSubmitting || loading}
          />
          {validationError && (
            <div className={styles.errorMessage}>{validationError}</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

