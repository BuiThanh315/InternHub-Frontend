import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, Select, Button } from '../../../../../components/common';
import { getAvatarUrl } from '../../../../../utils/avatar';
import type {
  MissionItemModalProps,
  CreateMissionItemRequest,
} from './MissionItemModal.types';
import type { MissionPriority } from '../../../../../types';
import styles from './MissionItemModal.module.css';

export const MissionItemModal: React.FC<MissionItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  programInterns,
  editingItem,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: MissionPriority;
    dueDate: string;
    assigneeInternIds: number[];
  }>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeInternIds: [],
  });

  const [searchInternQuery, setSearchInternQuery] = useState('');
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorAssignee, setErrorAssignee] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        description: editingItem.description || '',
        priority: editingItem.priority || 'MEDIUM',
        dueDate: editingItem.dueDate ? editingItem.dueDate.split('T')[0] : '',
        assigneeInternIds: editingItem.assignees ? editingItem.assignees.map((a) => a.id) : [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        assigneeInternIds: [],
      });
    }
    setSearchInternQuery('');
    setErrorTitle(null);
    setErrorAssignee(null);
  }, [editingItem, isOpen]);

  // Lọc TTS theo từ khóa tìm kiếm
  const filteredInterns = useMemo(() => {
    if (!searchInternQuery.trim()) return programInterns;
    const q = searchInternQuery.toLowerCase();
    return programInterns.filter(
      (intern) =>
        intern.fullName.toLowerCase().includes(q) ||
        intern.internCode.toLowerCase().includes(q) ||
        intern.email.toLowerCase().includes(q)
    );
  }, [programInterns, searchInternQuery]);

  // Toggle chọn TTS
  const handleToggleIntern = (internId: number) => {
    setErrorAssignee(null);
    setFormData((prev) => {
      const exists = prev.assigneeInternIds.includes(internId);
      return {
        ...prev,
        assigneeInternIds: exists
          ? prev.assigneeInternIds.filter((id) => id !== internId)
          : [...prev.assigneeInternIds, internId],
      };
    });
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    let hasError = false;
    if (!formData.title.trim()) {
      setErrorTitle('Vui lòng nhập tiêu đề công việc');
      hasError = true;
    }
    if (formData.assigneeInternIds.length === 0) {
      setErrorAssignee('Vui lòng chọn ít nhất 1 thực tập sinh tham gia công việc');
      hasError = true;
    }
    if (hasError) return;

    const payload: CreateMissionItemRequest = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      assigneeInternIds: formData.assigneeInternIds,
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  const isEditing = Boolean(editingItem);

  const priorityOptions = [
    { value: 'HIGH', label: 'Ưu tiên cao' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'LOW', label: 'Thấp' },
  ];

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
        {isEditing ? 'Lưu Thay Đổi' : 'Giao Việc Mới'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Mục Công Việc' : 'Giao Công Việc Mới Cho Thực Tập Sinh'}
      footer={footerContent}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Tiêu đề công việc"
          placeholder="Ví dụ: Cài đặt Spring Security và cấu hình JWT filter"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            if (errorTitle) setErrorTitle(null);
          }}
          error={errorTitle || undefined}
          required
        />

        <div className={styles.formGroup}>
          <label htmlFor="mission-item-description" className={styles.label}>
            Mô tả công việc chi tiết
          </label>
          <textarea
            id="mission-item-description"
            className={styles.textarea}
            placeholder="Yêu cầu chi tiết, tài liệu tham khảo hoặc tiêu chí hoàn thành..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className={styles.rowTwo}>
          <Select
            label="Mức độ ưu tiên"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priority: e.target.value as MissionPriority,
              }))
            }
          />

          <div className={styles.formGroup}>
            <label htmlFor="mission-item-duedate" className={styles.label}>
              Hạn hoàn thành (Deadline)
            </label>
            <input
              id="mission-item-duedate"
              type="date"
              className={styles.dateInput}
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Đề xuất 3: Multi-select Thực tập sinh dạng Checklist trực quan */}
        <div className={styles.assigneeSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.label}>
              Gán thực tập sinh ({formData.assigneeInternIds.length} đã chọn)
            </label>
          </div>

          <input
            type="text"
            className={styles.searchInternInput}
            placeholder="Tìm theo tên, mã TTS hoặc email..."
            aria-label="Tìm kiếm thực tập sinh"
            value={searchInternQuery}
            onChange={(e) => setSearchInternQuery(e.target.value)}
          />

          <div className={styles.internList}>
            {filteredInterns.length === 0 ? (
              <p className={styles.emptyInternText}>
                {programInterns.length === 0
                  ? 'Chương trình chưa có thực tập sinh nào'
                  : 'Không tìm thấy thực tập sinh phù hợp'}
              </p>
            ) : (
              filteredInterns.map((intern) => {
                const isSelected = formData.assigneeInternIds.includes(intern.id);
                const avatarSrc =
                  intern.avatarUrl ||
                  getAvatarUrl({
                    avatarUrl: intern.avatarUrl,
                    id: intern.id,
                    username: intern.fullName,
                  });

                return (
                  <label
                    key={intern.id}
                    className={`${styles.internItem} ${
                      isSelected ? styles.internItemSelected : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleIntern(intern.id)}
                      className={styles.checkbox}
                      aria-label={`Chọn ${intern.fullName}`}
                    />

                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={intern.fullName}
                        className={styles.internAvatar}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className={styles.internAvatarFallback}>
                        {intern.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className={styles.internInfo}>
                      <span className={styles.internName}>{intern.fullName}</span>
                      <span className={styles.internMeta}>
                        {intern.internCode} • {intern.email}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
          {errorAssignee && (
            <p className={styles.fieldError} role="alert">
              {errorAssignee}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default MissionItemModal;
