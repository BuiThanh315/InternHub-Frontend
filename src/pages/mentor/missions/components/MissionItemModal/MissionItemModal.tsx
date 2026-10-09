import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, UserPlus, UserMinus } from 'lucide-react';
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
  groups = [],
  internWorkloadMap = {},
  initialAssigneeId = null,
  initialTitle = '',
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
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [keepOpen, setKeepOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    dueDate?: string;
    assignee?: string;
  }>({});

  const todayString = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

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
        title: initialTitle || '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        assigneeInternIds: initialAssigneeId ? [initialAssigneeId] : [],
      });
    }
    setSearchInternQuery('');
    setSelectedGroupId('ALL');
    setFieldErrors({});
  }, [editingItem, isOpen, initialAssigneeId, initialTitle]);

  // Lọc TTS theo từ khóa và theo nhóm
  const filteredInterns = useMemo(() => {
    const q = searchInternQuery.toLowerCase().trim();
    return programInterns.filter((intern) => {
      const matchesSearch =
        q === '' ||
        intern.fullName.toLowerCase().includes(q) ||
        intern.internCode.toLowerCase().includes(q) ||
        intern.email.toLowerCase().includes(q);

      let matchesGroup = true;
      if (selectedGroupId !== 'ALL') {
        const targetGroupId = Number(selectedGroupId);
        const group = groups.find((g) => g.id === targetGroupId);
        matchesGroup = Boolean(group?.members.some((m) => m.id === intern.id));
      }

      return matchesSearch && matchesGroup;
    });
  }, [programInterns, searchInternQuery, selectedGroupId, groups]);

  // Tìm đối tượng nhóm đang chọn lọc
  const selectedGroup = useMemo(() => {
    if (selectedGroupId === 'ALL') return null;
    return groups.find((g) => g.id === Number(selectedGroupId)) || null;
  }, [groups, selectedGroupId]);

  // Danh sách các intern đã chọn (để hiển thị chips)
  const selectedAssignees = useMemo(() => {
    return programInterns.filter((i) => formData.assigneeInternIds.includes(i.id));
  }, [programInterns, formData.assigneeInternIds]);

  // Toggle chọn TTS
  const handleToggleIntern = (internId: number) => {
    setFieldErrors((prev) => ({ ...prev, assignee: undefined }));
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

  // Nút Chọn tất cả (toàn bộ chương trình)
  const handleSelectAll = () => {
    setFieldErrors((prev) => ({ ...prev, assignee: undefined }));
    const allIds = programInterns.map((i) => i.id);
    setFormData((prev) => ({ ...prev, assigneeInternIds: allIds }));
  };

  // Nút Bỏ chọn tất cả
  const handleClearAll = () => {
    setFormData((prev) => ({ ...prev, assigneeInternIds: [] }));
  };

  // Nút Chọn toàn bộ các học viên đang hiển thị theo bộ lọc / nhóm
  const handleSelectFiltered = () => {
    if (filteredInterns.length === 0) return;
    setFieldErrors((prev) => ({ ...prev, assignee: undefined }));
    const filteredIds = filteredInterns.map((i) => i.id);
    setFormData((prev) => {
      const merged = new Set([...prev.assigneeInternIds, ...filteredIds]);
      return { ...prev, assigneeInternIds: Array.from(merged) };
    });
  };

  // Nút Bỏ chọn các học viên thuộc danh sách đang lọc / nhóm
  const handleClearFiltered = () => {
    if (filteredInterns.length === 0) return;
    const filteredIdSet = new Set(filteredInterns.map((i) => i.id));
    setFormData((prev) => ({
      ...prev,
      assigneeInternIds: prev.assigneeInternIds.filter((id) => !filteredIdSet.has(id)),
    }));
  };


  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    const errors: { title?: string; dueDate?: string; assignee?: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề công việc';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Tiêu đề công việc phải có từ 3 đến 200 ký tự';
    }

    if (formData.dueDate && formData.dueDate < todayString) {
      errors.dueDate = 'Hạn hoàn thành không được ở trong quá khứ';
    }

    if (formData.assigneeInternIds.length === 0) {
      errors.assignee = 'Vui lòng chọn ít nhất 1 thực tập sinh tham gia công việc';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload: CreateMissionItemRequest = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      internIds: formData.assigneeInternIds,
      assigneeInternIds: formData.assigneeInternIds,
    };

    const success = await onSubmit(payload);
    if (success) {
      if (keepOpen && !editingItem) {
        // Reset form để tiếp tục tạo công việc khác
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: '',
          assigneeInternIds: [],
        });
        setFieldErrors({});
      } else {
        onClose();
      }
    }
  };

  const isEditing = Boolean(editingItem);

  const priorityOptions = [
    { value: 'HIGH', label: 'Ưu tiên cao' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'LOW', label: 'Thấp' },
  ];

  const groupFilterOptions = [
    { value: 'ALL', label: 'Tất cả các nhóm' },
    ...groups.map((g) => ({
      value: String(g.id),
      label: g.name,
    })),
  ];

  // Render Workload Badge nhỏ gọn
  const renderItemWorkloadBadge = (internId: number) => {
    const count = internWorkloadMap[internId] || 0;
    if (count >= 5) {
      return <span className={`${styles.workloadBadge} ${styles.workloadOverload}`}>{count} task (quá tải)</span>;
    }
    if (count >= 3) {
      return <span className={`${styles.workloadBadge} ${styles.workloadHeavy}`}>{count} task</span>;
    }
    return <span className={`${styles.workloadBadge} ${styles.workloadNormal}`}>{count} task</span>;
  };

  const footerContent = (
    <div className={styles.modalFooter}>
      <div>
        {!isEditing && (
          <label className={styles.keepOpenLabel}>
            <input
              type="checkbox"
              checked={keepOpen}
              onChange={(e) => setKeepOpen(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Tiếp tục tạo công việc khác</span>
          </label>
        )}
      </div>

      <div className={styles.footerButtons}>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isEditing ? 'Lưu Thay Đổi' : 'Giao Việc Cho TTS'}
        </Button>
      </div>
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
            if (fieldErrors.title) {
              setFieldErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          error={fieldErrors.title}
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
              min={todayString}
              className={`${styles.dateInput} ${fieldErrors.dueDate ? styles.inputError : ''}`}
              value={formData.dueDate}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }));
                if (fieldErrors.dueDate) {
                  setFieldErrors((prev) => ({ ...prev, dueDate: undefined }));
                }
              }}
            />
            {fieldErrors.dueDate && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.dueDate}
              </p>
            )}
          </div>
        </div>

        {/* Checklist Thực tập sinh nhận việc (Pro Task Delegation) */}
        <div className={styles.assigneeSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.label}>
              Thực tập sinh phụ trách ({formData.assigneeInternIds.length} đã chọn) *
            </label>
            <div className={styles.quickActionButtons}>
              {selectedGroupId !== 'ALL' ? (
                <>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={handleSelectFiltered}
                    disabled={filteredInterns.length === 0}
                    title={`Chọn toàn bộ ${filteredInterns.length} học viên trong ${selectedGroup?.name || 'nhóm'}`}
                  >
                    Chọn cả nhóm ({filteredInterns.length})
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={handleClearFiltered}
                    disabled={filteredInterns.length === 0}
                    title="Bỏ chọn các học viên trong nhóm đang lọc"
                  >
                    Bỏ chọn nhóm
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={handleSelectAll}
                    disabled={programInterns.length === 0}
                    title="Chọn tất cả học viên của toàn bộ chương trình"
                  >
                    Tất cả TTS ({programInterns.length})
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={handleSelectAll}
                    disabled={programInterns.length === 0}
                  >
                    Chọn tất cả ({programInterns.length})
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={handleClearAll}
                    disabled={formData.assigneeInternIds.length === 0}
                  >
                    Bỏ chọn
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Chips danh sách đã chọn */}
          {selectedAssignees.length > 0 && (
            <div className={styles.selectedChipsContainer}>
              {selectedAssignees.map((assignee) => (
                <span key={assignee.id} className={styles.chipTag}>
                  <span>{assignee.fullName}</span>
                  <button
                    type="button"
                    className={styles.removeChipBtn}
                    onClick={() => handleToggleIntern(assignee.id)}
                    title={`Bỏ chọn ${assignee.fullName}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Filter row: Search input & Nhóm dropdown */}
          <div className={styles.filterRow}>
            <input
              type="text"
              className={styles.searchInternInput}
              placeholder="Tìm theo tên, mã TTS..."
              aria-label="Tìm kiếm thực tập sinh"
              value={searchInternQuery}
              onChange={(e) => setSearchInternQuery(e.target.value)}
            />

            {groups.length > 0 && (
              <div className={styles.groupFilterSelect}>
                <Select
                  options={groupFilterOptions}
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Group Action Bar khi đang lọc theo nhóm */}
          {selectedGroup && (
            <div className={styles.groupActionRow}>
              <div className={styles.groupActionLeft}>
                <Users size={14} />
                <span>
                  Đang lọc: <strong>{selectedGroup.name}</strong> ({filteredInterns.length} học viên)
                </span>
              </div>
              <div className={styles.groupActionBtns}>
                <button
                  type="button"
                  className={styles.groupActionBtn}
                  onClick={handleSelectFiltered}
                  disabled={filteredInterns.length === 0}
                  title={`Chọn toàn bộ học viên trong nhóm ${selectedGroup.name}`}
                >
                  <UserPlus size={13} />
                  <span>Chọn cả nhóm ({filteredInterns.length})</span>
                </button>
                <button
                  type="button"
                  className={`${styles.groupActionBtn} ${styles.groupActionBtnSecondary}`}
                  onClick={handleClearFiltered}
                  disabled={filteredInterns.length === 0}
                  title={`Bỏ chọn học viên trong nhóm ${selectedGroup.name}`}
                >
                  <UserMinus size={13} />
                  <span>Bỏ chọn</span>
                </button>
              </div>
            </div>
          )}

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
                    <div className={styles.internItemLeft}>
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
                    </div>

                    <div>{renderItemWorkloadBadge(intern.id)}</div>
                  </label>
                );
              })
            )}
          </div>

          {fieldErrors.assignee && (
            <p className={styles.fieldError} role="alert">
              {fieldErrors.assignee}
            </p>
          )}

          <p className={styles.internHelpText}>
            Học viên đang nhận việc sẽ hiển thị số task đang làm để bạn tránh giao dồn task.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default MissionItemModal;
