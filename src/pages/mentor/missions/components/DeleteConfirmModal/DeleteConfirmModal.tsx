import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../../../../components/common';
import type { DeleteConfirmModalProps } from './DeleteConfirmModal.types';
import styles from './DeleteConfirmModal.module.css';

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  targetName,
  description,
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const footerContent = (
    <div className={styles.modalFooter}>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Hủy
      </Button>
      <Button
        variant="danger"
        onClick={handleConfirm}
        isLoading={isLoading}
        disabled={isLoading}
      >
        Xác Nhận Xóa
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footerContent}
      size="sm"
    >
      <div className={styles.content}>
        <div className={styles.warningBox}>
          <AlertTriangle size={20} className={styles.warningIcon} />
          <div className={styles.warningMessage}>
            <span>
              Bạn có chắc chắn muốn xóa <span className={styles.targetName}>"{targetName}"</span>?
            </span>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
