import React, { useEffect } from 'react';
import { CheckCircle2, X, AlertCircle, Info, Loader2 } from 'lucide-react';
import type { ApproveConfirmModalProps } from './ApproveConfirmModal.types';
import styles from './ApproveConfirmModal.module.css';

export const ApproveConfirmModal: React.FC<ApproveConfirmModalProps> = ({
  intern,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}) => {
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

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="approve-modal-title">
        {/* Khối 1: Header cố định */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <CheckCircle2 size={22} />
            </div>
            <h3 id="approve-modal-title" className={styles.title}>
              Phê Duyệt Tiếp Nhận Hồ Sơ
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
        <div className={styles.body}>
          {errorMessage && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Không thể duyệt hồ sơ:</strong> {errorMessage}
              </div>
            </div>
          )}

          <p className={styles.description}>
            Bạn có chắc chắn muốn phê duyệt tiếp nhận ứng viên{' '}
            <span className={styles.highlightName}>{intern.fullName}</span> vào danh sách thực tập sinh chính thức không?
          </p>

          <div className={styles.internSummaryCard}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Mã thực tập sinh</span>
              <span className={styles.codeBadge}>{intern.internCode}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Họ và tên</span>
              <span className={styles.summaryValue}>{intern.fullName}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Vị trí ứng tuyển</span>
              <span className={styles.summaryValue}>{intern.appliedPosition || 'Thực tập sinh'}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Trường Đại học</span>
              <span className={styles.summaryValue}>{intern.university}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Chuyên ngành</span>
              <span className={styles.summaryValue}>{intern.major}</span>
            </div>
          </div>

          <div className={styles.noteBanner}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Sau khi được tiếp nhận, hồ sơ sẽ chuyển sang trạng thái <strong>ĐÃ DUYỆT (APPROVED)</strong> và sẵn sàng để quản lý phân công Mentor hướng dẫn ở bước kế tiếp.
            </span>
          </div>
        </div>

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
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Xác Nhận Tiếp Nhận</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
