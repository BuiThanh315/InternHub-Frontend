import React, { useState, useEffect, useCallback } from 'react';
import { AlertOctagon, X, AlertCircle, Loader2, Ban } from 'lucide-react';
import { toast } from 'sonner';

import { contractService } from '../../../../services/contractService';
import type { RejectContractModalProps } from './RejectContractModal.types';

import styles from './RejectContractModal.module.css';

export const RejectContractModal: React.FC<RejectContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    },
    [isSubmitting, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !contract) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const trimmedReason = rejectionReason.trim();
  const isValidReason = trimmedReason.length >= 10 && trimmedReason.length <= 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidReason) {
      setErrorMessage('Lý do từ chối phải có độ dài từ 10 đến 1000 ký tự để phòng Nhân sự xử lý.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const updated = await contractService.rejectContract(contract.id, {
        rejectionReason: trimmedReason,
      });

      toast.info('Đã ghi nhận phản hồi từ chối hợp đồng thực tập.', {
        duration: 4000,
      });
      onClose();
      onSuccess(updated);
    } catch (err: any) {
      console.error('Lỗi khi từ chối hợp đồng:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể gửi phản hồi từ chối. Vui lòng thử lại.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <AlertOctagon size={22} />
            </div>
            <div>
              <h2 className={styles.title}>Từ Chối Ký Hợp Đồng Thực Tập</h2>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.warningBox}>
            Bạn đang yêu cầu từ chối tiếp nhận hợp đồng thực tập{' '}
            <strong>{contract.contractNumber || contract.contractTitle}</strong>.
            Hành động này sẽ gửi phản hồi chính thức đến phòng Nhân sự (HR) và hợp đồng sẽ không còn
            hiệu lực.
          </div>

          {errorMessage && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="rejectContractForm" onSubmit={handleSubmit} className={styles.formGroup}>
            <label htmlFor="rejectionReason" className={styles.label}>
              Lý do từ chối tiếp nhận <span className={styles.required}>*</span>
            </label>
            <textarea
              id="rejectionReason"
              className={styles.textarea}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Vui lòng nêu rõ lý do bạn không thể tham gia thực tập (tối thiểu 10 ký tự)..."
              disabled={isSubmitting}
              required
              minLength={10}
              maxLength={1000}
            />
            <span
              className={styles.charCount}
              style={{ color: rejectionReason.length < 10 ? 'var(--danger)' : undefined }}
            >
              {rejectionReason.length}/1000 ký tự (Tối thiểu 10 ký tự)
            </span>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Quay lại
          </button>
          <button
            type="submit"
            form="rejectContractForm"
            className={styles.dangerBtn}
            disabled={isSubmitting || !isValidReason}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                <span>Đang Xử Lý...</span>
              </>
            ) : (
              <>
                <Ban size={16} />
                <span>Xác Nhận Từ Chối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectContractModal;
