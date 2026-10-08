import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Users,
  Award,
  GraduationCap,
  KeyRound,
  FolderGit2,
  FileText,
  ShieldAlert,
  Layers,
  Filter,
  RotateCcw,
  Loader2,
  Save,
  Lock,
  Plus,
  Search,
  Check,
  X,
  FileCheck2,
  Sparkles,
  Kanban,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/common/Button/Button';
import { Skeleton } from '../../../components/common/Skeleton';
import { rbacService } from '../../../services/rbacService';
import type { RoleItem, PermissionGroup, PermissionItem } from '../../../types';
import styles from './AdminRoleTab.module.css';

function extractPermissionCodes(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;

  if (Array.isArray(obj.permissionCodes)) {
    return obj.permissionCodes
      .map((item) => (typeof item === 'string' ? item : (item as { code?: string })?.code))
      .filter((code): code is string => typeof code === 'string' && code.length > 0);
  }

  if (Array.isArray(obj.permissions)) {
    return obj.permissions
      .map((item) => (typeof item === 'string' ? item : (item as { code?: string })?.code))
      .filter((code): code is string => typeof code === 'string' && code.length > 0);
  }

  return [];
}

const SYSTEM_ROLES_ORDER = ['ADMIN', 'HR', 'MENTOR', 'INTERN'];

// Các đặc quyền tối cao của vai trò ADMIN - BẮT BUỘC KHÓA (Cấm tắt để chống Admin Self-Lockout)
const ROOT_ADMIN_LOCKED_PERMISSIONS = ['ROLE_MANAGE', 'ROLE_VIEW', 'USER_MANAGE', 'USER_VIEW'];

export const AdminRoleTab: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Vai trò đang chọn trên 4 Tab Lớn
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [initialCodes, setInitialCodes] = useState<string[]>([]);
  const [isLoadingRoleDetail, setIsLoadingRoleDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bộ lọc hiển thị và tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'GRANTED' | 'UNGRANTED'>('ALL');

  // Nạp danh sách vai trò và nhóm quyền ban đầu
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedRoles, fetchedPermissions] = await Promise.all([
        rbacService.getAllRoles(),
        rbacService.getPermissions(),
      ]);

      // Sắp xếp roles ưu tiên 4 role hệ thống chuẩn ADMIN, HR, MENTOR, INTERN
      const sortedRoles = [...fetchedRoles].sort((a, b) => {
        const indexA = SYSTEM_ROLES_ORDER.indexOf(a.name.toUpperCase());
        const indexB = SYSTEM_ROLES_ORDER.indexOf(b.name.toUpperCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      setRoles(sortedRoles);
      setPermissionGroups(fetchedPermissions);

      if (sortedRoles.length > 0) {
        setSelectedRole((prev) => {
          if (prev) {
            const found = sortedRoles.find((r) => r.id === prev.id);
            return found || sortedRoles[0];
          }
          return sortedRoles[0];
        });
      }
    } catch (err) {
      console.error('Lỗi khi nạp danh sách vai trò hoặc quyền hạn:', err);
      toast.error('Không thể tải danh sách vai trò hoặc quyền hạn từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Nạp chi tiết đặc quyền khi chuyển sang tab vai trò khác
  const loadRolePermissions = useCallback(async (role: RoleItem) => {
    try {
      setIsLoadingRoleDetail(true);
      const detail = await rbacService.getRoleById(role.id);
      const codes = extractPermissionCodes(detail);
      setSelectedCodes(codes);
      setInitialCodes(codes);
    } catch (err) {
      console.error(`Lỗi khi nạp chi tiết đặc quyền của vai trò ${role.name}:`, err);
      toast.error(`Không thể tải chi tiết đặc quyền của vai trò ${role.name}`);
    } finally {
      setIsLoadingRoleDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRole) {
      void loadRolePermissions(selectedRole);
    }
  }, [selectedRole, loadRolePermissions]);

  // Kiểm tra có thay đổi chưa lưu hay không
  const isDirty = useMemo(() => {
    if (selectedCodes.length !== initialCodes.length) return true;
    const currentSet = new Set(selectedCodes);
    return initialCodes.some((code) => !currentSet.has(code));
  }, [selectedCodes, initialCodes]);

  // VẤN ĐỀ 4: Cảnh báo người dùng trước khi đóng hoặc tải lại trang nếu có thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Danh sách toàn bộ quyền trong hệ thống
  const allSystemPermissions = useMemo(() => {
    return permissionGroups.flatMap((group) => group.permissions);
  }, [permissionGroups]);

  const totalPermissionsCount = allSystemPermissions.length;
  const grantedCount = selectedCodes.length;
  const percentGranted =
    totalPermissionsCount > 0 ? Math.round((grantedCount / totalPermissionsCount) * 100) : 0;

  // Kiểm tra quyền có bị khóa cứng không (Security Lockout Guard)
  const isPermissionLocked = useCallback(
    (code: string) => {
      if (selectedRole?.name.toUpperCase() === 'ADMIN') {
        return ROOT_ADMIN_LOCKED_PERMISSIONS.includes(code);
      }
      return false;
    },
    [selectedRole]
  );

  // Xử lý chuyển Tab vai trò
  const handleSelectTab = (role: RoleItem) => {
    if (selectedRole?.id === role.id) return;
    if (isDirty) {
      const confirmSwitch = window.confirm(
        `Bạn có thay đổi chưa lưu cho vai trò "${selectedRole?.name}". Bạn có chắc muốn chuyển tab và hủy bỏ các thay đổi này?`
      );
      if (!confirmSwitch) return;
    }
    setSelectedRole(role);
    setFilterMode('ALL');
    setSearchQuery('');
  };

  // Toggle 1 mã quyền (Bảo vệ Security Lockout)
  const handleToggleCode = (code: string) => {
    if (isPermissionLocked(code)) {
      toast.warning(`Đặc quyền "${code}" được khóa bảo vệ an toàn cho Quản Trị Viên (Admin), không thể tắt.`);
      return;
    }

    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Toggle toàn bộ quyền của 1 Module
  const handleToggleModule = (group: PermissionGroup) => {
    const groupCodes = group.permissions.map((p) => p.code);
    const nonLockedGroupCodes = groupCodes.filter((c) => !isPermissionLocked(c));
    const isAllSelected = groupCodes.every((code) => selectedCodes.includes(code));

    if (isAllSelected) {
      // Chỉ gỡ các quyền không bị khóa
      setSelectedCodes((prev) => prev.filter((c) => !nonLockedGroupCodes.includes(c)));
      if (groupCodes.some((c) => isPermissionLocked(c))) {
        toast.info('Các đặc quyền cốt lõi của Quản Trị Viên vẫn được giữ bật an toàn.');
      }
    } else {
      setSelectedCodes((prev) => Array.from(new Set([...prev, ...groupCodes])));
    }
  };

  // Batch actions
  const handleSelectAll = () => {
    setSelectedCodes(allSystemPermissions.map((p) => p.code));
  };

  const handleClearAll = () => {
    if (selectedRole?.name.toUpperCase() === 'ADMIN') {
      // Giữ lại các quyền khóa an toàn cho Admin
      setSelectedCodes([...ROOT_ADMIN_LOCKED_PERMISSIONS]);
      toast.info('Đã tắt tất cả đặc quyền tùy chọn (giữ nguyên các quyền quản trị tối cao của Admin).');
    } else {
      setSelectedCodes([]);
    }
  };

  const handleResetToInitial = () => {
    setSelectedCodes([...initialCodes]);
    toast.info('Đã khôi phục về trạng thái phân quyền ban đầu của vai trò');
  };

  // VẤN ĐỀ 1: Lưu phân quyền thực tế gọi Backend API qua PUT /api/system/roles/{id}
  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setIsSubmitting(true);
      console.log(`[RBAC] Gửi yêu cầu cập nhật vai trò ${selectedRole.name} (ID: ${selectedRole.id}) với ${selectedCodes.length} quyền:`, selectedCodes);
      
      const updatedRole = await rbacService.updateRole(selectedRole.id, {
        name: selectedRole.name,
        description: selectedRole.description,
        permissionCodes: selectedCodes,
      });

      console.log('[RBAC] Phản hồi cập nhật thành công từ máy chủ:', updatedRole);

      // Cập nhật state gốc với dữ liệu mới
      setInitialCodes([...selectedCodes]);

      // Đồng bộ lại danh sách vai trò
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id
            ? { ...r, permissionCount: selectedCodes.length, permissions: selectedCodes }
            : r
        )
      );

      toast.success(
        `Đã lưu cấu hình phân quyền thành công cho vai trò "${selectedRole.name}" (${selectedCodes.length} quyền)`
      );
    } catch (err: unknown) {
      console.error('[RBAC] Lỗi khi lưu phân quyền vai trò:', err);
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      toast.error(`Không thể lưu phân quyền: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (name: string) => {
    switch (name.toUpperCase()) {
      case 'ADMIN':
        return <Shield size={22} />;
      case 'HR':
        return <Users size={22} />;
      case 'MENTOR':
        return <Award size={22} />;
      case 'INTERN':
        return <GraduationCap size={22} />;
      default:
        return <KeyRound size={22} />;
    }
  };

  const getRoleBadgeColor = (name: string) => {
    switch (name.toUpperCase()) {
      case 'ADMIN':
        return {
          iconBg: 'rgba(239, 68, 68, 0.12)',
          iconColor: '#ef4444',
          badgeBg: 'rgba(239, 68, 68, 0.12)',
          badgeColor: '#dc2626',
          badgeBorder: 'rgba(239, 68, 68, 0.25)',
        };
      case 'HR':
        return {
          iconBg: 'rgba(99, 102, 241, 0.12)',
          iconColor: '#6366f1',
          badgeBg: 'rgba(99, 102, 241, 0.12)',
          badgeColor: '#4f46e5',
          badgeBorder: 'rgba(99, 102, 241, 0.25)',
        };
      case 'MENTOR':
        return {
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#10b981',
          badgeBg: 'rgba(16, 185, 129, 0.12)',
          badgeColor: '#059669',
          badgeBorder: 'rgba(16, 185, 129, 0.25)',
        };
      case 'INTERN':
        return {
          iconBg: 'rgba(6, 182, 212, 0.12)',
          iconColor: '#06b6d4',
          badgeBg: 'rgba(6, 182, 212, 0.12)',
          badgeColor: '#0891b2',
          badgeBorder: 'rgba(6, 182, 212, 0.25)',
        };
      default:
        return {
          iconBg: 'rgba(148, 163, 184, 0.12)',
          iconColor: '#94a3b8',
          badgeBg: 'rgba(148, 163, 184, 0.12)',
          badgeColor: '#64748b',
          badgeBorder: 'rgba(148, 163, 184, 0.25)',
        };
    }
  };

  const getModuleIcon = (moduleCode: string) => {
    switch (moduleCode.toUpperCase()) {
      case 'USER':
        return <Users size={18} className={styles.moduleIcon} />;
      case 'ROLE':
        return <ShieldAlert size={18} className={styles.moduleIcon} />;
      case 'INTERN':
        return <GraduationCap size={18} className={styles.moduleIcon} />;
      case 'DOCUMENT':
        return <FileText size={18} className={styles.moduleIcon} />;
      case 'CONTRACT':
        return <FileCheck2 size={18} className={styles.moduleIcon} />;
      case 'PROGRAM':
        return <FolderGit2 size={18} className={styles.moduleIcon} />;
      case 'MENTOR':
        return <Award size={18} className={styles.moduleIcon} />;
      case 'PROFILE':
        return <Users size={18} className={styles.moduleIcon} />;
      case 'MISSION':
        return <Kanban size={18} className={styles.moduleIcon} />;
      case 'ATTENDANCE':
        return <Clock size={18} className={styles.moduleIcon} />;
      case 'EVALUATION':
        return <Award size={18} className={styles.moduleIcon} />;
      case 'SYSTEM':
      default:
        return <Layers size={18} className={styles.moduleIcon} />;
    }
  };

  // Lọc các Module và Quyền theo tìm kiếm và bộ lọc trạng thái
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return permissionGroups
      .map((group) => {
        const filteredPerms = group.permissions.filter((p) => {
          // Lọc theo search
          if (q) {
            const matchName = p.name.toLowerCase().includes(q);
            const matchCode = p.code.toLowerCase().includes(q);
            const matchDesc = (p.description || '').toLowerCase().includes(q);
            if (!matchName && !matchCode && !matchDesc) return false;
          }

          // Lọc theo trạng thái
          const isGranted = selectedCodes.includes(p.code);
          if (filterMode === 'GRANTED' && !isGranted) return false;
          if (filterMode === 'UNGRANTED' && isGranted) return false;

          return true;
        });

        return {
          ...group,
          permissions: filteredPerms,
        };
      })
      .filter((group) => group.permissions.length > 0);
  }, [permissionGroups, searchQuery, filterMode, selectedCodes]);

  return (
    <div className={styles.container}>
      {/* 1. TOP HEADER & INTRO */}
      <div className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h2 className={styles.heading}>
            <Shield size={22} color="var(--primary)" /> Bảng Điều Khiển Phân Quyền Vai Trò
          </h2>
          <p className={styles.subHeading}>
            Gạt trực tiếp các Switch Toggle để cấp hoặc thu hồi quyền hạn theo từng phân hệ nghiệp vụ. Toàn bộ Route & Menu Sidebar tự động thích ứng theo cơ chế Permission-First.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div
            className={styles.disabledAddBtnWrapper}
            title="Tính năng tạo vai trò tùy chỉnh sẽ được mở rộng ở phiên bản sau"
          >
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled
              style={{ opacity: 0.65, cursor: 'not-allowed' }}
            >
              <Plus size={16} /> Tạo Vai Trò Mới
            </Button>
          </div>
        </div>
      </div>

      {/* 2. 4 TABS LỚN NỔI BẬT */}
      {isLoading ? (
        <div className={styles.tabsContainer}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px' }}>
              <Skeleton width="100%" height={36} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.tabsContainer}>
          {roles.map((role) => {
            const isActive = selectedRole?.id === role.id;
            const colors = getRoleBadgeColor(role.name);

            return (
              <button
                key={role.id}
                type="button"
                className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                onClick={() => handleSelectTab(role)}
              >
                <div className={styles.tabLeft}>
                  <div
                    className={styles.tabIconWrapper}
                    style={{ background: colors.iconBg, color: colors.iconColor }}
                  >
                    {getRoleIcon(role.name)}
                  </div>
                  <div className={styles.tabInfo}>
                    <span className={styles.tabRoleName}>{role.name}</span>
                    <span className={styles.tabRoleDesc}>
                      {role.description || `Vai trò ${role.name} trong hệ thống`}
                    </span>
                  </div>
                </div>

                <div className={styles.tabRightBadge}>
                  <span
                    className={styles.tabBadge}
                    style={{
                      background: colors.badgeBg,
                      color: colors.badgeColor,
                      border: `1px solid ${colors.badgeBorder}`,
                    }}
                  >
                    {role.isSystem ? 'Hệ thống' : 'Tùy chỉnh'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. KHUNG ĐIỀU KHIỂN & BẬT TẮT PHÂN QUYỀN ĐỘNG */}
      {selectedRole && (
        <div className={styles.matrixCard}>
          {/* Header vai trò đang chọn + Nút Lưu */}
          <div className={styles.roleHeaderBar}>
            <div className={styles.roleHeaderLeft}>
              <div
                className={styles.roleHeaderIcon}
                style={{
                  background: getRoleBadgeColor(selectedRole.name).iconBg,
                  color: getRoleBadgeColor(selectedRole.name).iconColor,
                }}
              >
                {getRoleIcon(selectedRole.name)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 className={styles.roleHeaderTitle}>
                    Đang cấu hình: {selectedRole.name}
                  </h3>
                  <span
                    className={styles.systemBadge}
                    style={{
                      background: getRoleBadgeColor(selectedRole.name).badgeBg,
                      color: getRoleBadgeColor(selectedRole.name).badgeColor,
                    }}
                  >
                    <Lock size={12} /> {selectedRole.isSystem ? 'Vai Trò Hệ Thống' : 'Tùy chỉnh'}
                  </span>
                </div>
                <p className={styles.roleHeaderDesc}>
                  {selectedRole.description || 'Quản lý và kích hoạt các quyền hạn truy cập nghiệp vụ'}
                </p>
              </div>
            </div>

            <div className={styles.saveActionsGroup}>
              {isDirty && (
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={handleResetToInitial}
                  disabled={isSubmitting}
                >
                  <RotateCcw size={14} /> Khôi phục ban đầu
                </button>
              )}

              {/* NATIVE SAVE BUTTON ĐẢM BẢO EVENT CLICK BẮT 100% */}
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={!isDirty || isSubmitting}
                className={`${styles.nativeSaveBtn} ${isDirty ? styles.saveButtonDirty : ''} ${
                  !isDirty || isSubmitting ? styles.saveBtnDisabled : ''
                }`}
                title={isDirty ? 'Nhấn để lưu các thay đổi phân quyền vào hệ thống' : 'Chưa có thay đổi nào cần lưu'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className={styles.spinner} />
                    <span>Đang lưu phân quyền...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Lưu Thay Đổi Phân Quyền</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Banner tiến độ cấp quyền */}
          <div className={styles.summaryBanner}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryTitle}>
                <Sparkles size={16} color="var(--primary)" /> Trạng Thái Cấp Quyền: {grantedCount}/{totalPermissionsCount} ({percentGranted}%)
              </div>

              <div className={styles.progressWrapper}>
                <div className={styles.progressBarBg}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${percentGranted}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar tìm kiếm & lọc nhanh */}
          <div className={styles.controlToolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên quyền, mã quyền hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={styles.clearSearchBtn}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.quickFilters}>
              <div className={styles.filterButtonGroup}>
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
                  <Check size={14} /> Đang bật ({grantedCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterMode === 'UNGRANTED' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterMode('UNGRANTED')}
                >
                  <X size={14} /> Đang tắt ({totalPermissionsCount - grantedCount})
                </button>
              </div>

              <div className={styles.batchActions}>
                <button
                  type="button"
                  className={styles.batchBtn}
                  onClick={handleSelectAll}
                  disabled={isSubmitting}
                >
                  Bật tất cả ({totalPermissionsCount})
                </button>
                <button
                  type="button"
                  className={styles.batchBtn}
                  onClick={handleClearAll}
                  disabled={isSubmitting}
                >
                  Tắt tất cả
                </button>
              </div>
            </div>
          </div>

          {/* DANH SÁCH CÁC CARD MODULE VỚI TOGGLE SWITCH */}
          {isLoadingRoleDetail ? (
            <div className={styles.loadingState}>
              <Loader2 size={32} className={styles.spinner} color="var(--primary)" />
              <p>Đang tải chi tiết phân quyền cho vai trò {selectedRole.name}...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className={styles.emptyState}>
              <Filter size={36} color="var(--text-muted)" />
              <h4>Không tìm thấy đặc quyền nào phù hợp</h4>
              <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc chuyển chế độ lọc.</p>
              <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setFilterMode('ALL'); }}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className={styles.modulesGrid}>
              {filteredGroups.map((group) => {
                const groupAllCodes = group.permissions.map((p) => p.code);
                const activeCountInGroup = groupAllCodes.filter((c) => selectedCodes.includes(c)).length;
                const isGroupAllActive = groupAllCodes.length > 0 && activeCountInGroup === groupAllCodes.length;
                const isGroupPartialActive = activeCountInGroup > 0 && activeCountInGroup < groupAllCodes.length;

                return (
                  <div key={group.module} className={styles.moduleCard}>
                    {/* Module Card Header */}
                    <div className={styles.moduleCardHeader}>
                      <div className={styles.moduleHeaderInfo}>
                        <div className={styles.moduleIconBadge}>
                          {getModuleIcon(group.module)}
                        </div>
                        <div>
                          <div className={styles.moduleTitleRow}>
                            <h4 className={styles.moduleName}>{group.moduleName}</h4>
                            <span className={styles.moduleTag}>{group.module}</span>
                          </div>
                          <p className={styles.moduleDesc}>
                            {activeCountInGroup}/{groupAllCodes.length} quyền đang kích hoạt
                          </p>
                        </div>
                      </div>

                      {/* Master Module Toggle */}
                      <div className={styles.moduleMasterToggle}>
                        <span className={styles.masterToggleLabel}>
                          {isGroupAllActive ? 'Bật toàn bộ' : isGroupPartialActive ? 'Một phần' : 'Tắt toàn bộ'}
                        </span>
                        <button
                          type="button"
                          className={`${styles.switchBtn} ${isGroupAllActive ? styles.switchActive : isGroupPartialActive ? styles.switchPartial : ''}`}
                          onClick={() => handleToggleModule(group)}
                          disabled={isSubmitting}
                          title={isGroupAllActive ? 'Tắt toàn bộ quyền trong module này' : 'Bật toàn bộ quyền trong module này'}
                          aria-label={`Bật tắt toàn bộ module ${group.moduleName}`}
                        >
                          <span className={styles.switchSlider} />
                        </button>
                      </div>
                    </div>

                    {/* Permission Items List */}
                    <div className={styles.permissionList}>
                      {group.permissions.map((perm: PermissionItem) => {
                        const isChecked = selectedCodes.includes(perm.code);
                        const isLocked = isPermissionLocked(perm.code);

                        return (
                          <div
                            key={perm.code}
                            className={`${styles.permissionRow} ${isChecked ? styles.permissionRowActive : ''} ${
                              isLocked ? styles.permissionRowLocked : ''
                            }`}
                            onClick={() => !isLocked && handleToggleCode(perm.code)}
                            title={isLocked ? 'Đặc quyền cốt lõi của Quản Trị Viên được khóa an toàn, không thể tắt' : undefined}
                          >
                            <div className={styles.permTextGroup}>
                              <div className={styles.permNameRow}>
                                <span className={styles.permName}>{perm.name}</span>
                                <span className={styles.permCode}>{perm.code}</span>
                                {isLocked && (
                                  <span className={styles.lockedBadge}>
                                    <Lock size={10} /> Khóa an toàn
                                  </span>
                                )}
                              </div>
                              <p className={styles.permDescription}>
                                {perm.description || `Cho phép thực thi nghiệp vụ ${perm.name}`}
                              </p>
                            </div>

                            <div className={styles.permToggleWrapper}>
                              <span className={`${styles.toggleStatusLabel} ${isChecked ? styles.labelActive : styles.labelInactive}`}>
                                {isLocked ? 'Bắt buộc bật' : isChecked ? 'Đang bật' : 'Đang tắt'}
                              </span>
                              <button
                                type="button"
                                className={`${styles.switchBtn} ${isChecked ? styles.switchActive : ''} ${
                                  isLocked ? styles.switchLocked : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isLocked) {
                                    handleToggleCode(perm.code);
                                  }
                                }}
                                disabled={isSubmitting || isLocked}
                                aria-label={`Bật tắt quyền ${perm.name}`}
                              >
                                <span className={styles.switchSlider} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRoleTab;
