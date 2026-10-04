import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { contractService } from '../../../../../services/contractService';
import type { ContractResponse } from '../../../../../types';
import styles from './TerminateContractModal.module.css';

interface TerminateContractModalProps {
  contract: ContractResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedContract: ContractResponse) => void;
}

export const TerminateContractModal: React.FC<TerminateContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !contract) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Lý do chấm dứt hợp đồng phải có ít nhất 5 ký tự');
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await contractService.terminateContract(contract.id, {
        terminationReason: reason.trim(),
      });
      toast.success(`Đã chấm dứt hợp đồng ${contract.contractNumber} thành công!`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể chấm dứt hợp đồng.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="terminate-title">
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconWrap}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 id="terminate-title" className={styles.title}>
                Chấm Dứt Hợp Đồng Trước Hạn
              </h3>
              <p className={styles.subTitle}>
                Hợp đồng: <strong>{contract.contractNumber}</strong> ({contract.internFullName})
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
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.warningBox}>
            <p className={styles.warningTitle}>Quy tắc bảo vệ pháp lý (Non-Deletable & Audit Trail):</p>
            <p className={styles.warningText}>
              Hợp đồng này sẽ được đánh dấu <strong>TERMINATED</strong> và lưu lại toàn bộ lịch sử (người chấm dứt, thời gian, lý do). Dữ liệu văn bản pháp lý trên hệ thống S3 hoàn toàn không bị xóa vật lý.
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="termination-reason" className={styles.fieldLabel}>
              Lý do chấm dứt hợp đồng <span className={styles.required}>*</span>
            </label>
            <textarea
              id="termination-reason"
              rows={4}
              className={styles.textarea}
              placeholder="VD: Thực tập sinh hoàn thành trước tiến độ / Có nguyện vọng chuyển trường..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
            <span className={styles.charCount}>{reason.length}/1000 ký tự</span>
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
              className={styles.terminateBtn}
              disabled={isSubmitting || reason.trim().length < 5}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  Đang xử lý...
                </>
              ) : (
                'Xác Nhận Chấm Dứt'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
