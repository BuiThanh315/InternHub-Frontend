import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Lock,
  Layers,
  CheckSquare,
  Square,
  Sparkles,
  FileCheck2,
  GraduationCap,
  FolderGit2,
  FileText,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../components/common/Modal/Modal';
import { Button } from '../../../components/common/Button/Button';
import { rbacService } from '../../../services/rbacService';
import type {
  RoleItem,
  RoleDetail,
  PermissionGroup,
} from '../../../types';
import styles from './RoleModal.module.css';

interface RoleModalProps {
  isOpen: boolean;
  role?: RoleItem | RoleDetail | null;
  permissionGroups: PermissionGroup[];
  onClose: () => void;
  onSuccess: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  role,
  permissionGroups,
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!role;
  const isSystem = !!role?.isSystem;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Tính tổng số lượng quyền hiện có trong toàn hệ thống
  const allSystemPermissions = useMemo(() => {
    return permissionGroups.flatMap((group) => group.permissions);
  }, [permissionGroups]);

  const totalPermissionsCount = allSystemPermissions.length;

  const loadRoleDetail = useCallback(async (roleId: number) => {
    try {
      setIsLoadingDetail(true);
      const detail = await rbacService.getRoleById(roleId);
      setName(detail.name);
      setDescription(detail.description || '');
      setSelectedCodes(detail.permissionCodes || detail.permissions.map((p) => p.code));
    } catch {
      toast.error('Không thể tải chi tiết đặc quyền của vai trò');
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Khởi tạo hoặc nạp dữ liệu khi mở Modal
  useEffect(() => {
    if (!isOpen) return;

    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setNameError(null);

      // Nếu đối tượng đã có danh sách permissionCodes đầy đủ
      if ('permissionCodes' in role && Array.isArray((role as RoleDetail).permissionCodes)) {
        setSelectedCodes((role as RoleDetail).permissionCodes);
      } else {
        // Gọi API lấy thông tin chi tiết vai trò
        void loadRoleDetail(role.id);
      }
    } else {
      setName('');
      setDescription('');
      setSelectedCodes([]);
      setNameError(null);
    }
  }, [isOpen, role, loadRoleDetail]);

  if (!isOpen) return null;

  // Xử lý bật/tắt 1 quyền đơn lẻ
  const handleToggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Xử lý chọn/bỏ chọn tất cả quyền của 1 Module
  const handleToggleModule = (group: PermissionGroup) => {
    const groupCodes = group.permissions.map((p) => p.code);
    const isAllSelected = groupCodes.every((code) => selectedCodes.includes(code));

    if (isAllSelected) {
      // Bỏ chọn tất cả quyền của module này
      setSelectedCodes((prev) => prev.filter((c) => !groupCodes.includes(c)));
    } else {
      // Chọn tất cả quyền của module này
      setSelectedCodes((prev) => Array.from(new Set([...prev, ...groupCodes])));
    }
  };

  // Chọn toàn bộ quyền hệ thống
  const handleSelectAll = () => {
    setSelectedCodes(allSystemPermissions.map((p) => p.code));
  };

  // Bỏ chọn toàn bộ quyền
  const handleClearAll = () => {
    setSelectedCodes([]);
  };

  // Lấy icon trực quan cho từng module
  const getModuleIcon = (moduleCode: string) => {
    switch (moduleCode.toUpperCase()) {
      case 'USER':
        return <Users size={16} className={styles.moduleIcon} />;
      case 'ROLE':
        return <ShieldAlert size={16} className={styles.moduleIcon} />;
      case 'INTERN':
        return <GraduationCap size={16} className={styles.moduleIcon} />;
      case 'PROGRAM':
        return <FolderGit2 size={16} className={styles.moduleIcon} />;
      case 'CONTRACT':
        return <FileCheck2 size={16} className={styles.moduleIcon} />;
      case 'DOCUMENT':
        return <FileText size={16} className={styles.moduleIcon} />;
      case 'SYSTEM':
      default:
        return <Layers size={16} className={styles.moduleIcon} />;
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const normalizedName = name.trim().toUpperCase();
    if (!isSystem && !normalizedName) {
      setNameError('Vui lòng nhập tên vai trò');
      return;
    }
    setNameError(null);

    setIsSubmitting(true);
    try {
      if (isEditMode && role) {
        await rbacService.updateRole(role.id, {
          name: isSystem ? undefined : normalizedName,
          description: description.trim(),
          permissionCodes: selectedCodes,
        });
        toast.success(`Cập nhật vai trò "${role.name}" thành công!`);
      } else {
        await rbacService.createRole({
          name: normalizedName,
          description: description.trim(),
          permissionCodes: selectedCodes,
        });
        toast.success(`Tạo vai trò mới "${normalizedName}" thành công!`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu vai trò';
      toast.error(msg);
      // Giữ nguyên modal và dữ liệu người dùng đang nhập theo UX Rules
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = (
    <div className={styles.titleArea}>
      <div className={styles.headerLeft}>
        <div className={styles.headerIcon}>
          <Shield size={18} />
        </div>
        <h2 className={styles.headerTitle}>
          {isEditMode ? `Cấu Hình Vai Trò: ${role.name}` : 'Tạo Mới Vai Trò & Phân Quyền'}
          {isSystem && (
            <span className={styles.systemBadge} title="Vai trò mặc định của hệ thống">
              <Lock size={11} /> Hệ Thống
            </span>
          )}
        </h2>
      </div>
      <span className={styles.counterBadge}>
        Đã cấp: {selectedCodes.length}/{totalPermissionsCount} đặc quyền
      </span>
    </div>
  );

  const modalFooter = (
    <div className={styles.modalFooter}>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Hủy Bỏ
      </Button>
      <Button
        type="submit"
        form="roleForm"
        variant="primary"
        isLoading={isSubmitting}
      >
        {isEditMode ? 'Lưu Phân Quyền' : 'Tạo Vai Trò'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="lg"
    >
      <form id="roleForm" onSubmit={handleSubmit} className={styles.modalBody}>
        {/* Thông tin cơ bản */}
        <div className={styles.sectionBox}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="roleNameInput" className={styles.formLabel}>
                Tên vai trò {!isSystem && <span className={styles.requiredStar}>*</span>}
              </label>
              <input
                id="roleNameInput"
                type="text"
                className={styles.inputControl}
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toUpperCase());
                  if (nameError) setNameError(null);
                }}
                disabled={isSystem || isSubmitting}
                placeholder="Ví dụ: TRAINING_LEAD, QA_REVIEWER"
                maxLength={50}
              />
              {nameError ? (
                <p className={styles.helpText} style={{ color: 'var(--danger)' }}>
                  {nameError}
                </p>
              ) : (
                <p className={styles.helpText}>
                  {isSystem
                    ? 'Vai trò hệ thống không được phép đổi tên'
                    : 'Định danh vai trò viết hoa không dấu (A-Z, dấu gạch dưới)'}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="roleDescInput" className={styles.formLabel}>
                Mô tả trách nhiệm & chức năng
              </label>
              <input
                id="roleDescInput"
                type="text"
                className={styles.inputControl}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                placeholder="Mô tả phạm vi quyền hạn và trách nhiệm của vai trò này"
                maxLength={255}
              />
              <p className={styles.helpText}>Hiển thị để người quản trị dễ dàng phân biệt</p>
            </div>
          </div>
        </div>

        {/* Ma trận phân quyền */}
        <div className={styles.sectionBox}>
          <div className={styles.matrixHeader}>
            <div className={styles.matrixTitle}>
              <Sparkles size={16} color="var(--primary)" /> Ma Trận Đặc Quyền Hệ Thống (RBAC Matrix)
            </div>
            <div className={styles.matrixActions}>
              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={handleSelectAll}
                disabled={isSubmitting || isLoadingDetail}
              >
                <CheckSquare size={13} style={{ display: 'inline', marginRight: 4 }} />
                Chọn tất cả ({totalPermissionsCount})
              </button>
              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={handleClearAll}
                disabled={isSubmitting || isLoadingDetail}
              >
                <Square size={13} style={{ display: 'inline', marginRight: 4 }} />
                Bỏ chọn tất cả
              </button>
            </div>
          </div>

          {isLoadingDetail ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              Đang tải dữ liệu cấu hình đặc quyền...
            </div>
          ) : (
            <div className={styles.moduleList}>
              {permissionGroups.map((group) => {
                const groupCodes = group.permissions.map((p) => p.code);
                const selectedInGroupCount = groupCodes.filter((c) =>
                  selectedCodes.includes(c)
                ).length;
                const isAllSelected =
                  groupCodes.length > 0 && selectedInGroupCount === groupCodes.length;

                return (
                  <div
                    key={group.module}
                    className={`${styles.moduleCard} ${
                      selectedInGroupCount > 0 ? styles.moduleCardActive : ''
                    }`}
                  >
                    <div className={styles.moduleCardHeader}>
                      <div className={styles.moduleTitleArea}>
                        {getModuleIcon(group.module)}
                        <span className={styles.moduleName}>{group.moduleName}</span>
                        <span className={styles.moduleCode}>{group.module}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.moduleToggleBtn}
                        onClick={() => handleToggleModule(group)}
                        disabled={isSubmitting}
                      >
                        {isAllSelected
                          ? 'Bỏ chọn module'
                          : `Chọn tất cả (${selectedInGroupCount}/${group.permissions.length})`}
                      </button>
                    </div>

                    <div className={styles.permissionGrid}>
                      {group.permissions.map((perm) => {
                        const isChecked = selectedCodes.includes(perm.code);
                        return (
                          <label
                            key={perm.code}
                            className={`${styles.permissionItem} ${
                              isChecked ? styles.permissionItemSelected : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkboxInput}
                              checked={isChecked}
                              onChange={() => handleToggleCode(perm.code)}
                              disabled={isSubmitting}
                            />
                            <div className={styles.permissionContent}>
                              <div className={styles.permissionTitleRow}>
                                <span className={styles.permissionLabel}>{perm.name}</span>
                                <span className={styles.permissionCodeTag}>{perm.code}</span>
                              </div>
                              {perm.description && (
                                <span className={styles.permissionDesc}>{perm.description}</span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
