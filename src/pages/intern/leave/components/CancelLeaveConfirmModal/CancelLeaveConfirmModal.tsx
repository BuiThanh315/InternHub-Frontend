import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal, Button } from '../../../../../components/common';
import { formatDate } from '../../../../../utils/formatters';
import type { CancelLeaveConfirmModalProps } from './CancelLeaveConfirmModal.types';
import styles from './CancelLeaveConfirmModal.module.css';

export const CancelLeaveConfirmModal: React.FC<CancelLeaveConfirmModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isSubmitting}
      title="Xác Nhận Hủy Đơn Xin Nghỉ"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Giữ Lại Đơn
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<Trash2 size={16} />}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Hủy Đơn'}
          </Button>
        </>
      }
    >
      <div className={styles.modalBody}>
        <div className={styles.warningIconWrapper}>
          <AlertTriangle size={28} />
        </div>
        <h3 className={styles.title}>Bạn có chắc chắn muốn hủy đơn này?</h3>
        <p className={styles.description}>
          Đơn xin nghỉ phép đang ở trạng thái chờ duyệt. Sau khi hủy, đơn sẽ
          chuyển sang trạng thái <span className={styles.highlightText}>Đã hủy bỏ</span> và
          không thể khôi phục lại.
        </p>

        <div className={styles.detailCard}>
          <div>
            <strong>Mã đơn:</strong> #LR-{item.id}
          </div>
          <div>
            <strong>Loại nghỉ:</strong> {item.leaveTypeDescription || item.leaveType}
          </div>
          <div>
            <strong>Thời gian:</strong> {formatDate(item.startDate)} ➔ {formatDate(item.endDate)} (
            {item.totalDays?.toFixed(1)} ngày công)
          </div>
        </div>
      </div>
    </Modal>
  );
};
