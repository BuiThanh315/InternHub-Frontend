import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Lock,
  CheckSquare,
  Square,
  Sparkles,
  FileCheck2,
  GraduationCap,
  FolderGit2,
  FileText,
  Users,
  ShieldAlert,
  Layers,
  Filter,
  RotateCcw,
  Eye,
  Loader2,
  Kanban,
  Clock,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../components/common/Modal/Modal';
import { Button } from '../../../components/common/Button/Button';
import { rbacService } from '../../../services/rbacService';
import type {
  RoleItem,
  RoleDetail,
  PermissionGroup,
  PermissionItem,
} from '../../../types';
import styles from './RoleModal.module.css';

interface RoleModalProps {
  isOpen: boolean;
  role?: RoleItem | RoleDetail | null;
  permissionGroups: PermissionGroup[];
  onClose: () => void;
  onSuccess: () => void;
}

type CapabilityCategory = 'VIEW' | 'CREATE' | 'EDIT' | 'ACTION' | 'ADMIN';

interface CategoryCol {
  id: CapabilityCategory;
  label: string;
  subLabel: string;
}

const MATRIX_COLUMNS: CategoryCol[] = [
  { id: 'VIEW', label: 'Xem & Tra Cứu', subLabel: 'Quyền đọc (Read-only)' },
  { id: 'CREATE', label: 'Tạo Mới', subLabel: 'Thêm hồ sơ mới' },
  { id: 'EDIT', label: 'Chỉnh Sửa', subLabel: 'Cập nhật thông tin' },
  { id: 'ACTION', label: 'Duyệt & Nghiệp Vụ', subLabel: 'Phê duyệt, phân công' },
  { id: 'ADMIN', label: 'Quản Trị Cao Cấp', subLabel: 'Quản lý toàn quyền' },
];

function getPermissionCategory(code: string): CapabilityCategory {
  if (code.endsWith('_VIEW') || code.includes('_VIEW')) return 'VIEW';
  if (code.endsWith('_CREATE')) return 'CREATE';
  if (code.endsWith('_EDIT')) return 'EDIT';
  if (
    code.includes('APPROVE') ||
    code.includes('ASSIGN') ||
    code.includes('REVIEW') ||
    code.includes('CHECK')
  ) {
    return 'ACTION';
  }
  return 'ADMIN';
}

function getPillStatusClass(isFull: boolean, isPartial: boolean): string {
  if (isFull) return styles.pillFull;
  if (isPartial) return styles.pillPartial;
  return styles.pillNone;
}

function getPillStatusLabel(isFull: boolean, isPartial: boolean): string {
  if (isFull) return 'Toàn quyền';
  if (isPartial) return 'Một phần';
  return 'Chưa cấp';
}

function getCountBadgeClass(isAll: boolean, isPartial: boolean): string {
  if (isAll) return styles.countFull;
  if (isPartial) return styles.countPartial;
  return styles.countNone;
}

/**
 * Trích xuất danh sách mã đặc quyền an toàn từ RoleItem hoặc RoleDetail
 * Hỗ trợ cả string[] lẫn object[] { code: string }
 */
function extractPermissionCodes(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;

  // Trường hợp 1: Mảng permissionCodes
  if (Array.isArray(obj.permissionCodes)) {
    return obj.permissionCodes
      .map((item) => (typeof item === 'string' ? item : (item as { code?: string })?.code))
      .filter((code): code is string => typeof code === 'string' && code.length > 0);
  }

  // Trường hợp 2: Mảng permissions (Backend trả về List<String> hoặc List<Permission>)
  if (Array.isArray(obj.permissions)) {
    return obj.permissions
      .map((item) => (typeof item === 'string' ? item : (item as { code?: string })?.code))
      .filter((code): code is string => typeof code === 'string' && code.length > 0);
  }

  return [];
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
  const [initialCodes, setInitialCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Bộ lọc hiển thị ma trận
  const [filterMode, setFilterMode] = useState<'ALL' | 'GRANTED' | 'UNGRANTED'>('ALL');

  // Toàn bộ danh sách quyền phẳng
  const allSystemPermissions = useMemo(() => {
    return permissionGroups.flatMap((group) => group.permissions);
  }, [permissionGroups]);

  const totalPermissionsCount = allSystemPermissions.length;
  const grantedCount = selectedCodes.length;
  const percentGranted = totalPermissionsCount > 0 ? Math.round((grantedCount / totalPermissionsCount) * 100) : 0;

  const loadRoleDetail = useCallback(async (roleId: number) => {
    try {
      setIsLoadingDetail(true);
      const detail = await rbacService.getRoleById(roleId);
      setName(detail.name);
      setDescription(detail.description || '');
      const codes = extractPermissionCodes(detail);
      setSelectedCodes(codes);
      setInitialCodes(codes);
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

      // Trích xuất ngay lập tức các đặc quyền hiện có từ prop
      const existingCodes = extractPermissionCodes(role);
      setSelectedCodes(existingCodes);
      setInitialCodes(existingCodes);

      // Luôn tải lại chi tiết mới nhất từ server để đồng bộ chính xác
      void loadRoleDetail(role.id);
    } else {
      setName('');
      setDescription('');
      setSelectedCodes([]);
      setInitialCodes([]);
      setNameError(null);
    }
    setFilterMode('ALL');
  }, [isOpen, role, loadRoleDetail]);

  if (!isOpen) return null;

  // Bật/tắt 1 quyền đơn lẻ
  const handleToggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Bật/tắt toàn bộ quyền của 1 Module (Hàng)
  const handleToggleModule = (group: PermissionGroup) => {
    const groupCodes = group.permissions.map((p) => p.code);
    const isAllSelected = groupCodes.every((code) => selectedCodes.includes(code));

    if (isAllSelected) {
      setSelectedCodes((prev) => prev.filter((c) => !groupCodes.includes(c)));
    } else {
      setSelectedCodes((prev) => Array.from(new Set([...prev, ...groupCodes])));
    }
  };

  // Bật/tắt toàn bộ quyền của 1 Cột (Category)
  const handleToggleColumn = (catId: CapabilityCategory) => {
    const colPermissions = allSystemPermissions.filter(
      (p) => getPermissionCategory(p.code) === catId
    );
    const colCodes = colPermissions.map((p) => p.code);
    const isAllColSelected = colCodes.length > 0 && colCodes.every((c) => selectedCodes.includes(c));

    if (isAllColSelected) {
      setSelectedCodes((prev) => prev.filter((c) => !colCodes.includes(c)));
    } else {
      setSelectedCodes((prev) => Array.from(new Set([...prev, ...colCodes])));
    }
  };

  // Chọn toàn bộ quyền
  const handleSelectAll = () => {
    setSelectedCodes(allSystemPermissions.map((p) => p.code));
  };

  // Bỏ chọn toàn bộ
  const handleClearAll = () => {
    setSelectedCodes([]);
  };

  // Khôi phục danh mục quyền ban đầu của vai trò
  const handleResetToInitial = () => {
    setSelectedCodes(initialCodes);
    toast.info(`Đã khôi phục về ${initialCodes.length} đặc quyền ban đầu của vai trò`);
  };

  // Chọn nhanh các quyền xem & tra cứu (Read-only)
  const handleSelectReadOnly = () => {
    const viewCodes = allSystemPermissions
      .filter((p) => getPermissionCategory(p.code) === 'VIEW')
      .map((p) => p.code);
    setSelectedCodes((prev) => Array.from(new Set([...prev, ...viewCodes])));
  };

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
      case 'MENTOR':
        return <Award size={16} className={styles.moduleIcon} />;
      case 'PROFILE':
        return <Users size={16} className={styles.moduleIcon} />;
      case 'MISSION':
        return <Kanban size={16} className={styles.moduleIcon} />;
      case 'ATTENDANCE':
        return <Clock size={16} className={styles.moduleIcon} />;
      case 'EVALUATION':
        return <Award size={16} className={styles.moduleIcon} />;
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
      
      // Phát tín hiệu thời gian thực để toàn bộ các tab trình duyệt đồng bộ ngay lập tức
      try {
        const channel = new BroadcastChannel('internhub_rbac_sync');
        channel.postMessage({ type: 'PERMISSIONS_UPDATED', roleName: role?.name || normalizedName });
        channel.close();
      } catch {
        // Fallback an toàn nếu browser không hỗ trợ
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu vai trò';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = (
    <div className={styles.titleArea}>
      <div className={styles.headerLeft}>
        <div className={styles.headerIcon}>
          <Shield size={20} />
        </div>
        <div>
          <h2 className={styles.headerTitle}>
            {isEditMode ? `Cấu Hình Vai Trò: ${role.name}` : 'Tạo Mới Vai Trò & Phân Quyền'}
            {isSystem ? (
              <span className={styles.systemBadge} title="Vai trò mặc định của hệ sinh thái">
                <Lock size={11} /> Hệ Thống
              </span>
            ) : (
              <span className={styles.customBadge}>Tùy Chỉnh</span>
            )}
          </h2>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isLoadingDetail && (
          <span className={styles.loadingSyncBadge} title="Đang đồng bộ đặc quyền từ hệ thống...">
            <Loader2 size={13} className={styles.spinIcon} /> Đang đồng bộ...
          </span>
        )}
        <span className={styles.counterBadge}>
          Đã cấp: {grantedCount}/{totalPermissionsCount} đặc quyền ({percentGranted}%)
        </span>
      </div>
    </div>
  );

  const modalFooter = (
    <div className={styles.modalFooter}>
      <div className={styles.footerInfo}>
        <Sparkles size={15} color="var(--primary)" />
        <span>
          Đang cấp <strong>{grantedCount}</strong> trên tổng số <strong>{totalPermissionsCount}</strong> đặc quyền cho vai trò này
        </span>
      </div>
      <div className={styles.footerButtons}>
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
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="xl"
    >
      <form id="roleForm" onSubmit={handleSubmit} className={styles.modalBody}>
        {/* 1. THÔNG TIN CƠ BẢN */}
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
              <p className={styles.helpText}>Hiển thị để người quản trị dễ dàng nhận biết</p>
            </div>
          </div>
        </div>

        {/* 2. TỔNG QUAN NĂNG LỰC CỦA VAI TRÒ (CAPABILITY OVERVIEW BANNER) */}
        <div className={styles.summaryBanner}>
          <div className={styles.summaryHeader}>
            <div className={styles.summaryTitle}>
              <Sparkles size={16} color="var(--primary)" /> Tóm Tắt Năng Lực & Chức Năng Cấp Quyền
            </div>

            <div className={styles.progressWrapper}>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${percentGranted}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {grantedCount}/{totalPermissionsCount} ({percentGranted}%)
              </span>
            </div>
          </div>

          {/* Module Status Chips */}
          <div className={styles.moduleStatusGrid}>
            {permissionGroups.map((group) => {
              const groupCodes = group.permissions.map((p) => p.code);
              const selectedCount = groupCodes.filter((c) => selectedCodes.includes(c)).length;
              const isFull = groupCodes.length > 0 && selectedCount === groupCodes.length;
              const isPartial = selectedCount > 0 && selectedCount < groupCodes.length;

              const statusClass = getPillStatusClass(isFull, isPartial);
              const statusLabel = getPillStatusLabel(isFull, isPartial);

              return (
                <div
                  key={group.module}
                  className={`${styles.moduleStatusPill} ${statusClass}`}
                  title={`${group.moduleName}: ${statusLabel} (${selectedCount}/${group.permissions.length} đặc quyền)`}
                >
                  {getModuleIcon(group.module)}
                  <span>{group.moduleName}</span>
                  <span className={styles.pillBadge}>
                    {statusLabel} ({selectedCount}/{group.permissions.length})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. TOOLBAR BẢNG MA TRẬN & BỘ LỌC */}
        <div className={styles.matrixToolbar}>
          <div className={styles.quickFilters}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Filter size={13} /> Lọc hiển thị:
            </span>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterMode === 'ALL' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('ALL')}
            >
              Tất cả ({totalPermissionsCount})
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterMode === 'GRANTED' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('GRANTED')}
            >
              Đã cấp ({grantedCount})
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterMode === 'UNGRANTED' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('UNGRANTED')}
            >
              Chưa cấp ({totalPermissionsCount - grantedCount})
            </button>
          </div>

          <div className={styles.batchActions}>
            {isEditMode && initialCodes.length > 0 && (
              <button
                type="button"
                className={styles.batchBtn}
                onClick={handleResetToInitial}
                disabled={isSubmitting || isLoadingDetail}
                title="Khôi phục lại danh sách đặc quyền ban đầu của vai trò này"
              >
                <RotateCcw size={13} /> Khôi phục ban đầu ({initialCodes.length})
              </button>
            )}
            <button
              type="button"
              className={styles.batchBtn}
              onClick={handleSelectReadOnly}
              disabled={isSubmitting || isLoadingDetail}
              title="Chỉ chọn các đặc quyền xem & tra cứu (Read-only)"
            >
              <Eye size={13} /> Chỉ quyền xem
            </button>
            <button
              type="button"
              className={styles.batchBtn}
              onClick={handleSelectAll}
              disabled={isSubmitting || isLoadingDetail}
            >
              <CheckSquare size={13} /> Chọn tất cả (17)
            </button>
            <button
              type="button"
              className={styles.batchBtn}
              onClick={handleClearAll}
              disabled={isSubmitting || isLoadingDetail}
            >
              <Square size={13} /> Bỏ chọn tất cả
            </button>
          </div>
        </div>

        {/* 4. BẢNG MA TRẬN PHÂN QUYỀN TRỰC QUAN (MATRIX TABLE) */}
        <div className={styles.tableContainer}>
          <div className={styles.matrixTableWrapper}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th style={{ width: '250px' }}>
                    Phân Hệ / Module Nghiệp Vụ
                  </th>
                  {MATRIX_COLUMNS.map((col) => {
                    const colPerms = allSystemPermissions.filter(
                      (p) => getPermissionCategory(p.code) === col.id
                    );
                    const selectedInCol = colPerms.filter((p) =>
                      selectedCodes.includes(p.code)
                    ).length;
                    const isAllCol = colPerms.length > 0 && selectedInCol === colPerms.length;

                    return (
                      <th key={col.id}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <span>{col.label}</span>
                            {colPerms.length > 0 && (
                              <button
                                type="button"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: isAllCol ? 'var(--primary)' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '1px 4px',
                                  borderRadius: 4,
                                }}
                                onClick={() => handleToggleColumn(col.id)}
                                title={`Bật/tắt toàn bộ cột ${col.label}`}
                              >
                                ({selectedInCol}/{colPerms.length})
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none' }}>
                            {col.subLabel}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {isLoadingDetail && permissionGroups.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      Đang tải dữ liệu cấu hình ma trận đặc quyền...
                    </td>
                  </tr>
                ) : (
                  permissionGroups.map((group) => {
                    const groupCodes = group.permissions.map((p) => p.code);
                    const selectedInGroup = groupCodes.filter((c) => selectedCodes.includes(c)).length;
                    const isAllGroup = groupCodes.length > 0 && selectedInGroup === groupCodes.length;
                    const isPartialGroup = selectedInGroup > 0 && selectedInGroup < groupCodes.length;

                    const countBadgeClass = getCountBadgeClass(isAllGroup, isPartialGroup);
                    const groupStatusLabel = getPillStatusLabel(isAllGroup, isPartialGroup);

                    return (
                      <tr key={group.module} className={styles.matrixRow}>
                        {/* Cột 1: Thông tin Module & Nút chọn cả hàng */}
                        <td className={styles.moduleCell}>
                          <div className={styles.moduleCellHeader}>
                            <div className={styles.moduleCheckboxWrapper}>
                              <input
                                type="checkbox"
                                className={styles.permCheckbox}
                                checked={isAllGroup}
                                onChange={() => handleToggleModule(group)}
                                disabled={isSubmitting}
                                title={isAllGroup ? 'Bỏ chọn toàn bộ module này' : 'Chọn toàn bộ đặc quyền của module này'}
                              />
                            </div>
                            <div className={styles.moduleMeta}>
                              <div className={styles.moduleNameRow}>
                                {getModuleIcon(group.module)}
                                <span className={styles.moduleNameText}>{group.moduleName}</span>
                              </div>
                              <div className={styles.moduleStatusRow}>
                                <span className={styles.moduleTag}>{group.module}</span>
                                <span className={`${styles.moduleCountBadge} ${countBadgeClass}`}>
                                  {groupStatusLabel} ({selectedInGroup}/{group.permissions.length})
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2-6: Các ô đặc quyền tương ứng với từng Category */}
                        {MATRIX_COLUMNS.map((col) => {
                          const permsInCell = group.permissions.filter(
                            (p) => getPermissionCategory(p.code) === col.id
                          );

                          // Áp dụng filter hiển thị nếu có
                          const visiblePerms = permsInCell.filter((p) => {
                            if (filterMode === 'GRANTED') return selectedCodes.includes(p.code);
                            if (filterMode === 'UNGRANTED') return !selectedCodes.includes(p.code);
                            return true;
                          });

                          if (permsInCell.length === 0) {
                            return (
                              <td key={col.id} className={styles.emptyCellDash}>
                                —
                              </td>
                            );
                          }

                          return (
                            <td key={col.id}>
                              <div className={styles.permissionCellContent}>
                                {visiblePerms.length === 0 && filterMode !== 'ALL' ? (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    (Không khớp bộ lọc)
                                  </span>
                                ) : (
                                  visiblePerms.map((perm: PermissionItem) => {
                                    const isChecked = selectedCodes.includes(perm.code);
                                    return (
                                      <label
                                        key={perm.code}
                                        className={`${styles.permPill} ${
                                          isChecked ? styles.permPillChecked : ''
                                        }`}
                                        title={`${perm.code}: ${perm.description || perm.name}`}
                                      >
                                        <input
                                          type="checkbox"
                                          className={styles.permCheckbox}
                                          checked={isChecked}
                                          onChange={() => handleToggleCode(perm.code)}
                                          disabled={isSubmitting}
                                        />
                                        <div className={styles.permInfo}>
                                          <span className={styles.permName}>
                                            {perm.name}
                                          </span>
                                          <span className={styles.permCode}>
                                            {perm.code}
                                          </span>
                                          {perm.description && (
                                            <span className={styles.permDesc}>
                                              {perm.description}
                                            </span>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
