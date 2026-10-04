import React, { useState } from 'react';
import { HelpCircle, X, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { contractService } from '../../../../services/contractService';
import type { ContractResponse } from '../../../../types';
import styles from './ContractInquiryModal.module.css';

interface ContractInquiryModalProps {
  contract: ContractResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedContract: ContractResponse) => void;
}

const COMMON_ISSUES = [
  'Bản scan bị mờ / mất chữ / thiếu trang',
  'Sai lệch thông tin họ tên, CCCD hoặc ngày sinh',
  'Chưa đúng mức phụ cấp hoặc thời hạn thực tập',
  'Cần giải thích thêm về điều khoản quyền sở hữu trí tuệ',
];

export const ContractInquiryModal: React.FC<ContractInquiryModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectQuickIssue = (issue: string) => {
    if (feedbackNotes.includes(issue)) return;
    setFeedbackNotes((prev) => (prev ? `${prev}\n• ${issue}` : `• ${issue}`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNotes.trim() || feedbackNotes.trim().length < 5) {
      toast.error('Vui lòng nêu rõ thắc mắc (ít nhất 5 ký tự) để HR hỗ trợ bạn');
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await contractService.submitFeedback(contract.id, {
        feedbackNotes: feedbackNotes.trim(),
      });
      toast.success('Đã gửi phản hồi thắc mắc đến bộ phận HR thành công!');
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi phản hồi. Vui lòng thử lại sau.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconWrap}>
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 id="inquiry-title" className={styles.title}>
                Gửi Thắc Mắc Về Hợp Đồng
              </h3>
              <p className={styles.subTitle}>
                Hợp đồng: <strong>{contract.contractNumber}</strong> — {contract.contractTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.noticeBox}>
            <AlertTriangle size={18} className={styles.noticeIcon} />
            <p className={styles.noticeText}>
              Khi bạn gửi thắc mắc, trạng thái hợp đồng sẽ chuyển thành <strong>Thực tập sinh thắc mắc</strong>. HR phụ trách sẽ xem xét để điều chỉnh hoặc gửi lại bản scan rõ nét hơn cho bạn.
            </p>
          </div>

          <div className={styles.quickIssuesSection}>
            <label className={styles.fieldLabel}>Gợi ý vấn đề thường gặp (chọn để thêm nhanh):</label>
            <div className={styles.quickTags}>
              {COMMON_ISSUES.map((issue, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.tagBtn}
                  onClick={() => handleSelectQuickIssue(issue)}
                  disabled={isSubmitting}
                >
                  + {issue}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="inquiry-notes" className={styles.fieldLabel}>
              Chi tiết thắc mắc / nội dung cần làm rõ <span className={styles.required}>*</span>
            </label>
            <textarea
              id="inquiry-notes"
              rows={5}
              className={styles.textarea}
              placeholder="VD: Bản scan trang 2 bị mờ phần mức phụ cấp, nhờ anh/chị tải lại giúp em..."
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              disabled={isSubmitting}
            />
            <span className={styles.charCount}>{feedbackNotes.length}/1000 ký tự</span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || feedbackNotes.trim().length < 5}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  Đang gửi phản hồi...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Gửi Phản Hồi Tới HR
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
