import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Plus,
  Search,
  Lock,
  Sparkles,
  Users,
  Award,
  GraduationCap,
  KeyRound,
  Trash2,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/common/Button/Button';
import { ConfirmModal } from '../../../components/common/Modal/ConfirmModal';
import { Skeleton } from '../../../components/common/Skeleton';
import { rbacService } from '../../../services/rbacService';
import type { RoleItem, PermissionGroup } from '../../../types';
import { RoleModal } from './RoleModal';
import styles from './AdminRoleTab.module.css';

export const AdminRoleTab: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SYSTEM' | 'CUSTOM'>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PERMISSIONS_DESC' | 'USERS_DESC' | 'NAME_ASC'>('DEFAULT');

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Nạp danh sách vai trò và danh mục đặc quyền
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedRoles, fetchedPermissions] = await Promise.all([
        rbacService.getAllRoles(),
        rbacService.getPermissions(),
      ]);
      setRoles(fetchedRoles);
      setPermissionGroups(fetchedPermissions);
    } catch {
      toast.error('Không thể tải danh sách vai trò hoặc quyền hạn từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Bộ lọc và sắp xếp
  const filteredRoles = useMemo(() => {
    let result = [...roles];

    // Tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }

    // Lọc theo loại vai trò
    if (typeFilter === 'SYSTEM') {
      result = result.filter((r) => r.isSystem);
    } else if (typeFilter === 'CUSTOM') {
      result = result.filter((r) => !r.isSystem);
    }

    // Sắp xếp
    if (sortBy === 'PERMISSIONS_DESC') {
      result.sort((a, b) => b.permissionCount - a.permissionCount);
    } else if (sortBy === 'USERS_DESC') {
      result.sort((a, b) => b.userCount - a.userCount);
    } else if (sortBy === 'NAME_ASC') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [roles, searchQuery, typeFilter, sortBy]);

  // Mở Modal tạo mới
  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  // Mở Modal cấu hình vai trò
  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  // Xác nhận xóa vai trò
  const handleConfirmDelete = async () => {
    if (!deletingRole) return;
    try {
      setIsDeleting(true);
      await rbacService.deleteRole(deletingRole.id);
      toast.success(`Đã xóa vai trò "${deletingRole.name}" thành công!`);
      setDeletingRole(null);
      void fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa vai trò thất bại';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleIcon = (name: string) => {
    switch (name.toUpperCase()) {
      case 'ADMIN':
        return <Shield size={19} />;
      case 'HR':
        return <Users size={19} />;
      case 'MENTOR':
        return <Award size={19} />;
      case 'INTERN':
        return <GraduationCap size={19} />;
      default:
        return <KeyRound size={19} />;
    }
  };

  const getDeleteTooltip = (role: RoleItem): string => {
    if (role.isSystem) {
      return 'Vai trò hệ thống không được phép xóa';
    }
    if (role.userCount > 0) {
      return `Vai trò đang được gán cho ${role.userCount} tài khoản. Vui lòng chuyển vai trò trước khi xóa.`;
    }
    return 'Xóa vai trò này';
  };

  const systemRolesCount = roles.filter((r) => r.isSystem).length;
  const customRolesCount = roles.filter((r) => !r.isSystem).length;

  const emptyDescription = searchQuery
    ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
    : 'Hiện chưa có vai trò nào trong danh mục này.';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.rolesGrid}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="80%" height={16} />
              <Skeleton width="100%" height={36} />
              <Skeleton width="100%" height={32} />
            </div>
          ))}
        </div>
      );
    }

    if (filteredRoles.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HelpCircle size={24} />
          </div>
          <h3 className={styles.emptyTitle}>Không tìm thấy vai trò phù hợp</h3>
          <p className={styles.emptyDesc}>{emptyDescription}</p>
          {searchQuery && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.rolesGrid}>
        {filteredRoles.map((role) => {
          const isDeleteDisabled = role.isSystem || role.userCount > 0;
          const deleteTooltip = getDeleteTooltip(role);

          return (
            <div key={role.id} className={styles.roleCard}>
              <div className={styles.cardTop}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.roleIdentity}>
                    <div className={styles.roleIconBadge}>
                      {getRoleIcon(role.name)}
                    </div>
                    <h3 className={styles.roleName}>{role.name}</h3>
                  </div>

                  {role.isSystem ? (
                    <span className={styles.systemBadge} title="Vai trò mặc định của hệ thống">
                      <Lock size={11} /> Hệ Thống
                    </span>
                  ) : (
                    <span className={styles.customBadge} title="Vai trò tùy chỉnh được tạo bởi quản trị viên">
                      Tùy Chỉnh
                    </span>
                  )}
                </div>

                <p className={styles.roleDescription}>
                  {role.description || 'Chưa thiết lập mô tả cho vai trò này.'}
                </p>
              </div>

              <div>
                <div className={styles.statsRow}>
                  <div className={styles.statItem} title={`Được cấp ${role.permissionCount} đặc quyền`}>
                    <Sparkles size={14} className={styles.statItemIcon} />
                    <span>{role.permissionCount}/17 đặc quyền</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statItem} title={`${role.userCount} tài khoản đang sử dụng vai trò này`}>
                    <Users size={14} className={styles.statItemIcon} />
                    <span>{role.userCount} tài khoản</span>
                  </div>
                </div>

                <div className={styles.cardProgressWrapper}>
                  <div className={styles.cardProgressBarBg}>
                    <div
                      className={styles.cardProgressBarFill}
                      style={{ width: `${Math.min(100, Math.round((role.permissionCount / 17) * 100))}%` }}
                    />
                  </div>
                  <div className={styles.cardProgressTextRow}>
                    <span>Tỷ lệ cấp quyền</span>
                    <strong>{Math.min(100, Math.round((role.permissionCount / 17) * 100))}%</strong>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.actionBtnGroup}>
                    <button
                      type="button"
                      className={styles.configBtn}
                      onClick={() => handleOpenEdit(role)}
                      title="Xem và chỉnh sửa cấu hình đặc quyền"
                    >
                      <Settings size={15} />
                      Xem & Cấu Hình Quyền
                    </button>

                    <button
                      type="button"
                      className={styles.deleteBtn}
                      disabled={isDeleteDisabled}
                      title={deleteTooltip}
                      onClick={() => setDeletingRole(role)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* 1. TOOLBAR & CONTROLS */}
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarTop}>
          <div className={styles.titleArea}>
            <h2 className={styles.heading}>
              <Shield size={20} color="var(--primary)" /> Quản Lý Vai Trò & Phân Quyền Động (Dynamic RBAC)
            </h2>
            <p className={styles.subHeading}>
              Thiết lập danh mục vai trò người dùng và cấu hình ma trận đặc quyền bảo mật cấp vi hạt
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
          >
            <Plus size={16} /> Tạo Vai Trò Mới
          </Button>
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.filtersLeft}>
            <div className={styles.searchInputWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm kiếm vai trò theo tên, mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="ALL">Tất cả vai trò ({roles.length})</option>
              <option value="SYSTEM">Vai trò hệ thống ({systemRolesCount})</option>
              <option value="CUSTOM">Vai trò tùy chỉnh ({customRolesCount})</option>
            </select>

            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="DEFAULT">Sắp xếp mặc định</option>
              <option value="PERMISSIONS_DESC">Nhiều đặc quyền nhất</option>
              <option value="USERS_DESC">Nhiều người dùng nhất</option>
              <option value="NAME_ASC">Tên vai trò (A-Z)</option>
            </select>
          </div>

          <div className={styles.statsCount}>
            Hiển thị: {filteredRoles.length}/{roles.length} vai trò
          </div>
        </div>
      </div>

      {/* 2. ROLES CARDS GRID */}
      {renderContent()}

      {/* 3. ROLE MODAL (CREATE / EDIT) */}
      <RoleModal
        isOpen={isRoleModalOpen}
        role={editingRole}
        permissionGroups={permissionGroups}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* 4. CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingRole}
        title="Xác nhận xóa vai trò"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn vai trò "${deletingRole?.name}"? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa Vai Trò"
        cancelText="Hủy Bỏ"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingRole(null)}
      />
    </div>
  );
};

export default AdminRoleTab;
