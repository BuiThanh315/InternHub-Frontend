import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../../../components/common';
import type {
  MissionBoardModalProps,
  MissionBoardFormData,
} from './MissionBoardModal.types';
import styles from './MissionBoardModal.module.css';

export const MissionBoardModal: React.FC<MissionBoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBoard,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<MissionBoardFormData>({
    title: '',
    description: '',
    dueDate: '',
  });

  const [errorTitle, setErrorTitle] = useState<string | null>(null);

  useEffect(() => {
    if (editingBoard) {
      setFormData({
        title: editingBoard.title || '',
        description: editingBoard.description || '',
        dueDate: editingBoard.dueDate ? editingBoard.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
      });
    }
    setErrorTitle(null);
  }, [editingBoard, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrorTitle('Vui lòng nhập tên bảng nhiệm vụ');
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  const isEditing = Boolean(editingBoard);

  const footerContent = (
    <div className={styles.modalFooter}>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Hủy
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isEditing ? 'Lưu Thay Đổi' : 'Tạo Bảng Nhiệm Vụ'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Bảng Nhiệm Vụ' : 'Tạo Bảng Nhiệm Vụ Mới'}
      footer={footerContent}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Tên bảng nhiệm vụ"
          placeholder="Ví dụ: Sprint 1 - Xây dựng Module Báo cáo"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            if (errorTitle) setErrorTitle(null);
          }}
          error={errorTitle || undefined}
          required
        />

        <div className={styles.formGroup}>
          <label htmlFor="mission-board-description" className={styles.label}>
            Mô tả mục tiêu bảng (tùy chọn)
          </label>
          <textarea
            id="mission-board-description"
            className={styles.textarea}
            placeholder="Mô tả phạm vi hoặc mục tiêu của bảng nhiệm vụ này..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mission-board-duedate" className={styles.label}>
            Hạn hoàn thành bảng (tùy chọn)
          </label>
          <input
            id="mission-board-duedate"
            type="date"
            className={styles.dateInput}
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />
        </div>
      </form>
    </Modal>
  );
};

export default MissionBoardModal;
