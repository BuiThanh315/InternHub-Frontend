import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSignature,
  X,
  FileText,
  ExternalLink,
  Download,
  AlertCircle,
  Loader2,
  Calendar,
  Building2,
  BadgeDollarSign,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import { contractService } from '../../../../services/contractService';
import type { ConfirmContractModalProps } from './ConfirmContractModal.types';
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  getContractStatusLabel,
} from '../../../../utils/formatters';

import styles from './ConfirmContractModal.module.css';

export const ConfirmContractModal: React.FC<ConfirmContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSuccess,
  onOpenReject,
  defaultSignerName = '',
}) => {
  const [formData, setFormData] = useState({
    signerFullName: defaultSignerName,
    agreeTerms: false,
    confirmationNote: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cập nhật tên người ký khi mở modal hoặc thay đổi defaultSignerName
  useEffect(() => {
    if (isOpen) {
      setFormData({
        signerFullName: defaultSignerName || contract?.internFullName || '',
        agreeTerms: false,
        confirmationNote: '',
      });
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, defaultSignerName, contract]);

  // Đóng modal khi nhấn phím ESC
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

  const isExpired = contract.endDate ? new Date(contract.endDate) < new Date() : false;
  const isAlreadySigned = contract.status === 'SIGNED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setErrorMessage('Bạn cần đánh dấu đồng ý với các điều khoản của hợp đồng trước khi xác nhận ký.');
      return;
    }

    if (!formData.signerFullName.trim() || formData.signerFullName.trim().length < 2) {
      setErrorMessage('Vui lòng nhập họ và tên pháp lý của bạn để xác nhận chữ ký điện tử (tối thiểu 2 ký tự).');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const updated = await contractService.confirmContract(contract.id, {
        agreeTerms: true,
        signerFullName: formData.signerFullName.trim(),
        confirmationNote: formData.confirmationNote.trim() || undefined,
      });

      toast.success('Xác nhận ký hợp đồng thực tập thành công! Chào mừng bạn chính thức gia nhập.', {
        duration: 4000,
      });
      onClose();
      onSuccess(updated);
    } catch (err: any) {
      console.error('Lỗi khi ký hợp đồng:', err);
      // Giữ nguyên modal và form, hiển thị lỗi rõ ràng (Safe Mutation UX - Nguyên tắc 24)
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể hoàn tất xác nhận ký hợp đồng. Vui lòng thử lại.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Khối 1: Header cố định */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <FileSignature size={22} />
            </div>
            <div>
              <h2 className={styles.title}>Xác Nhận Ký Hợp Đồng Thực Tập</h2>
              <p className={styles.subtitle}>
                Số HĐ: <strong>{contract.contractNumber || 'Hệ thống tự cấp'}</strong> • Trạng thái:{' '}
                {getContractStatusLabel(contract.status)}
              </p>
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

        {/* Khối 2: Body cuộn độc lập */}
        <div className={styles.body}>
          {errorMessage && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {isExpired && (
            <div
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid var(--warning, #eab308)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--warning, #eab308)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={18} />
              <span>Hợp đồng này đã hết hạn hiệu lực ({formatDate(contract.endDate)}). Vui lòng liên hệ HR để được cấp hợp đồng mới.</span>
            </div>
          )}

          {/* Tóm tắt thông tin pháp lý */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tiêu đề hợp đồng</span>
                <span className={styles.infoValue}>{contract.contractTitle}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Thực tập sinh</span>
                <span className={styles.infoValue}>
                  {contract.internFullName || defaultSignerName || '—'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Thời hạn thực tập
                </span>
                <span className={styles.infoValue}>
                  {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <BadgeDollarSign size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Mức phụ cấp hàng tháng
                </span>
                <span className={`${styles.infoValue} ${styles.allowanceHighlight}`}>
                  {contract.allowanceAmount ? formatCurrency(contract.allowanceAmount) : 'Không có phụ cấp'}
                </span>
              </div>
              {contract.uploadedBy && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Phát hành bởi
                  </span>
                  <span className={styles.infoValue}>{contract.uploadedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Thẻ tệp văn bản hợp đồng & nút xem trước/tải về */}
          <div className={styles.fileCard}>
            <div className={styles.fileInfo}>
              <FileText size={24} className={styles.fileIcon} />
              <div className={styles.fileDetails}>
                <span className={styles.fileName}>{contract.originalFileName}</span>
                <span className={styles.fileSize}>{formatFileSize(contract.fileSize)}</span>
              </div>
            </div>
            <div className={styles.fileActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => contractService.previewContractFile(contract.id)}
                title="Mở xem văn bản hợp đồng trong tab mới"
              >
                <ExternalLink size={14} />
                <span>Xem Trước</span>
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => contractService.downloadContractFile(contract.id, contract.originalFileName)}
                title="Tải văn bản hợp đồng về máy tính"
              >
                <Download size={14} />
                <span>Tải Xuống</span>
              </button>
            </div>
          </div>

          {/* Form cam kết & xác nhận chữ ký */}
          <form id="confirmContractForm" onSubmit={handleSubmit} className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="signerFullName" className={styles.label}>
                Họ và tên người ký xác nhận <span className={styles.required}>*</span>
              </label>
              <input
                id="signerFullName"
                type="text"
                className={styles.input}
                value={formData.signerFullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, signerFullName: e.target.value }))
                }
                placeholder="Nhập đầy đủ họ và tên theo giấy tờ tùy thân"
                disabled={isSubmitting || isExpired || isAlreadySigned}
                required
                maxLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmationNote" className={styles.label}>
                Ghi chú / Lời nhắn gửi đến phòng Nhân sự (Tùy chọn)
              </label>
              <textarea
                id="confirmationNote"
                className={styles.textarea}
                value={formData.confirmationNote}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmationNote: e.target.value }))
                }
                placeholder="Ví dụ: Em đã đọc kỹ và hoàn toàn nhất trí với thời hạn cùng các điều khoản..."
                disabled={isSubmitting || isExpired || isAlreadySigned}
                maxLength={1000}
              />
              <span className={styles.charCount}>
                {formData.confirmationNote.length}/1000 ký tự
              </span>
            </div>

            {/* Checkbox cam kết điều khoản bắt buộc */}
            <label className={styles.agreeContainer}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))
                }
                disabled={isSubmitting || isExpired || isAlreadySigned}
              />
              <span className={styles.agreeText}>
                Tôi xác nhận đã đọc, hiểu rõ văn bản hợp đồng đính kèm và <strong>đồng ý tuân thủ</strong> toàn bộ quy chế, nghĩa vụ thực tập theo quy định của doanh nghiệp.
              </span>
            </label>
          </form>
        </div>

        {/* Khối 3: Sticky Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {!isAlreadySigned && !isExpired && (
              <button
                type="button"
                className={styles.rejectBtn}
                onClick={() => onOpenReject(contract)}
                disabled={isSubmitting}
                title="Từ chối ký hợp đồng thực tập này"
              >
                <span>Từ chối tiếp nhận</span>
              </button>
            )}
          </div>
          <div className={styles.footerRight}>
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
              form="confirmContractForm"
              className={styles.submitBtn}
              disabled={
                isSubmitting ||
                isExpired ||
                isAlreadySigned ||
                !formData.agreeTerms ||
                !formData.signerFullName.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  <span>Đang Ký Điện Tử...</span>
                </>
              ) : (
                <>
                  <FileSignature size={16} />
                  <span>Xác Nhận Ký Hợp Đồng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmContractModal;
