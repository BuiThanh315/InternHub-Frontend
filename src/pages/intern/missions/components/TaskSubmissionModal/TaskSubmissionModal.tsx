import React, { useState, useEffect } from 'react';
import { CheckCircle2, Link as LinkIcon, MessageSquare, AlertCircle } from 'lucide-react';

import { Modal, Button, Input } from '../../../../../components/common';
import type { TaskSubmissionModalProps } from './TaskSubmissionModal.types';
import styles from './TaskSubmissionModal.module.css';

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({
  isOpen,
  onClose,
  item,
  onSubmit,
  isSubmitting = false,
}) => {
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  // Điền sẵn dữ liệu nếu item đã từng có kết quả nộp bài trước đó
  useEffect(() => {
    if (isOpen && item) {
      setSubmissionUrl(item.submissionUrl || '');
      setCompletionNote(item.completionNote || '');
      setUrlError(null);
    }
  }, [isOpen, item]);

  if (!item) return null;

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Tùy chọn (optional)
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (submissionUrl.trim() && !validateUrl(submissionUrl)) {
      setUrlError('Đường dẫn không hợp lệ. Vui lòng nhập link đầy đủ (ví dụ: https://github.com/...)');
      return;
    }

    setUrlError(null);
    const success = await onSubmit(
      item.id,
      submissionUrl.trim() || null,
      completionNote.trim() || null
    );

    if (success) {
      onClose();
    }
  };

  const isDirty =
    submissionUrl !== (item.submissionUrl || '') ||
    completionNote !== (item.completionNote || '');

  const modalFooter = (
    <div className={styles.footerActions}>
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Hủy bỏ
      </Button>
      <Button
        variant="primary"
        style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
        onClick={() => handleSubmit()}
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        <CheckCircle2 size={16} /> Nộp & Hoàn Thành
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop={!isDirty}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          <span>Nộp Sản Phẩm & Hoàn Thành</span>
        </div>
      }
      footer={modalFooter}
      size="md"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Banner thông báo */}
        <div className={styles.noticeBanner}>
          <AlertCircle size={18} className={styles.noticeIcon} />
          <div>
            Bạn sắp chuyển nhiệm vụ <strong>"{item.title}"</strong> sang trạng thái{' '}
            <strong style={{ color: 'var(--success)' }}>Hoàn thiện</strong>. Hãy đính kèm link sản
            phẩm thực tế để Mentor dễ dàng kiểm tra và nghiệm thu kết quả.
          </div>
        </div>

        {/* Input link nộp bài */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="submissionUrl">
            <LinkIcon size={15} />
            <span>Đường dẫn nộp bài (GitHub PR, Figma, Doc, Drive...)</span>
            <span className={styles.optionalTag}>(Tùy chọn)</span>
          </label>
          <Input
            id="submissionUrl"
            type="url"
            placeholder="https://github.com/org/repo/pull/42"
            value={submissionUrl}
            onChange={(e) => {
              setSubmissionUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            error={urlError || undefined}
          />
        </div>

        {/* Textarea ghi chú hoàn thành */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="completionNote">
            <MessageSquare size={15} />
            <span>Ghi chú gửi Mentor</span>
            <span className={styles.optionalTag}>(Tối đa 500 ký tự)</span>
          </label>
          <textarea
            id="completionNote"
            className={styles.textarea}
            placeholder="Tóm tắt ngắn gọn những gì bạn đã làm hoặc lưu ý gửi Mentor..."
            value={completionNote}
            maxLength={500}
            onChange={(e) => setCompletionNote(e.target.value)}
          />
          <span className={styles.charCount}>{completionNote.length}/500</span>
        </div>
      </form>
    </Modal>
  );
};

export default TaskSubmissionModal;
