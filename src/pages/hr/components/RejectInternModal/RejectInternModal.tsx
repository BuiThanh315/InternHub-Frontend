import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, AlertCircle, Loader2 } from 'lucide-react';
import type { RejectInternModalProps } from './RejectInternModal.types';
import styles from './RejectInternModal.module.css';

const QUICK_REASONS = [
  'Hồ sơ chưa đạt yêu cầu về chứng chỉ ngoại ngữ',
  'Thời gian thực tập cam kết dưới 3 tháng',
  'Chưa đáp ứng đủ kiến thức kỹ thuật yêu cầu',
  'Đã tuyển đủ số lượng cho vị trí này',
  'Thông tin hồ sơ/CV không đầy đủ hoặc thiếu tính xác thực',
];

export const RejectInternModal: React.FC<RejectInternModalProps> = ({
  intern,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setTouched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !intern) return null;

  const trimmedLength = reason.trim().length;
  const isTooShort = trimmedLength > 0 && trimmedLength < 5;
  const isInvalid = trimmedLength < 5;
  const hasError = touched && isInvalid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isInvalid || isSubmitting) return;
    onConfirm(reason.trim());
  };

  const handleSelectQuickReason = (selected: string) => {
    setReason(selected);
    setTouched(true);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        // Chỉ đóng khi form chưa được gõ (tránh mất dữ liệu vô tình)
        if (e.target === e.currentTarget && !isSubmitting && trimmedLength === 0) {
          onClose();
        }
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
        {/* Khối 1: Header cố định */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <AlertTriangle size={22} />
            </div>
            <h3 id="reject-modal-title" className={styles.title}>
              Từ Chối Hồ Sơ Thực Tập Sinh
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng hộp thoại"
          >
            <X size={20} />
          </button>
        </div>

        {/* Khối 2: Body cuộn độc lập */}
        <form id="reject-intern-form" onSubmit={handleSubmit} className={styles.body}>
          {errorMessage && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Lỗi từ chối hồ sơ:</strong> {errorMessage}
              </div>
            </div>
          )}

          <div className={styles.warningBox}>
            Hành động này sẽ từ chối tiếp nhận ứng viên{' '}
            <strong className={styles.highlightName}>{intern.fullName}</strong> ({intern.internCode}). Trạng thái hồ sơ sẽ được cập nhật thành{' '}
            <strong style={{ color: 'var(--danger)' }}>TỪ CHỐI (REJECTED)</strong>.
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <label htmlFor="rejection-reason" className={styles.label}>
                Lý do từ chối <span className={styles.requiredStar}>*</span>
              </label>
              <span
                className={`${styles.charCount} ${
                  trimmedLength >= 5 ? styles.charCountValid : isTooShort ? styles.charCountWarning : ''
                }`}
              >
                {trimmedLength} / 1000 ký tự (tối thiểu 5)
              </span>
            </div>

            <textarea
              id="rejection-reason"
              className={`${styles.textarea} ${hasError ? styles.textareaError : ''}`}
              placeholder="Vui lòng nhập lý do từ chối cụ thể để làm cơ sở thông báo và phản hồi cho ứng viên..."
              value={reason}
              maxLength={1000}
              onChange={(e) => {
                setReason(e.target.value);
                if (!touched) setTouched(true);
              }}
              disabled={isSubmitting}
              autoFocus
              rows={4}
            />

            {hasError && (
              <div className={styles.fieldErrorText}>
                <AlertCircle size={14} />
                <span>
                  {trimmedLength === 0
                    ? 'Lý do từ chối không được để trống'
                    : 'Lý do từ chối phải có độ dài tối thiểu từ 5 ký tự trở lên'}
                </span>
              </div>
            )}
          </div>

          <div className={styles.quickReasonSection}>
            <span className={styles.quickReasonTitle}>Gợi ý lý do nhanh:</span>
            <div className={styles.quickChipContainer}>
              {QUICK_REASONS.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  className={styles.quickChip}
                  onClick={() => handleSelectQuickReason(qr)}
                  disabled={isSubmitting}
                >
                  + {qr}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Khối 3: Sticky Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="reject-intern-form"
            className="btn btn-danger"
            disabled={isInvalid || isSubmitting}
            style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                <span>Xác Nhận Từ Chối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
