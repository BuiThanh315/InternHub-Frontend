import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  ShieldCheck,
  Building2,
  GraduationCap,
  FileSignature,
  FileCheck2,
  FolderGit2,
  FileText,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { getAvatarUrl } from '../../utils/avatar';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  requiredPermission?: string;
  section: string;
  allowedRoles?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, role, hasPermission, logout } = useAuth();

  // Danh mục toàn bộ các mục điều hướng phân theo Section
  const ALL_NAV_ITEMS: NavItemConfig[] = [
    // 1. Phân hệ Quản Trị Hệ Thống (CHỈ ADMIN)
    {
      to: ROUTES.ADMIN.DASHBOARD,
      label: 'Bảng Điều Khiển',
      icon: LayoutDashboard,
      requiredPermission: 'ROLE_VIEW',
      section: 'Hệ Thống',
      allowedRoles: ['ADMIN'],
    },
    {
      to: ROUTES.ADMIN.USERS,
      label: 'Quản Lý Người Dùng',
      icon: Users,
      requiredPermission: 'USER_VIEW',
      section: 'Hệ Thống',
      allowedRoles: ['ADMIN'],
    },
    {
      to: ROUTES.ADMIN.ROLES,
      label: 'Phân Quyền & Vai Trò',
      icon: Shield,
      requiredPermission: 'ROLE_VIEW',
      section: 'Hệ Thống',
      allowedRoles: ['ADMIN'],
    },
    {
      to: ROUTES.ADMIN.SYSTEM,
      label: 'Giám Sát Hệ Thống',
      icon: ShieldCheck,
      requiredPermission: 'SYSTEM_AUDIT_VIEW',
      section: 'Hệ Thống',
      allowedRoles: ['ADMIN'],
    },

    // 2. Phân hệ Quản Trị Nhân Sự (DÀNH RIÊNG CHO HR - ADMIN KHÔNG BỊ NHỒI NHÉT)
    {
      to: ROUTES.HR.DASHBOARD,
      label: 'Bảng Điều Khiển HR',
      icon: LayoutDashboard,
      requiredPermission: 'INTERN_VIEW_ALL',
      section: 'Quản Trị Nhân Sự',
      allowedRoles: ['HR'],
    },
    {
      to: ROUTES.HR.PROGRAMS,
      label: 'Chương Trình Thực Tập',
      icon: FolderGit2,
      requiredPermission: 'PROGRAM_VIEW',
      section: 'Quản Trị Nhân Sự',
      allowedRoles: ['HR'],
    },
    {
      to: ROUTES.HR.MENTORS,
      label: 'Phòng Ban & Mentor',
      icon: Building2,
      requiredPermission: 'MENTOR_VIEW',
      section: 'Quản Trị Nhân Sự',
      allowedRoles: ['HR'],
    },
    {
      to: ROUTES.HR.INTERNS,
      label: 'Hồ Sơ Thực Tập Sinh',
      icon: GraduationCap,
      requiredPermission: 'INTERN_VIEW_ALL',
      section: 'Quản Trị Nhân Sự',
      allowedRoles: ['HR'],
    },
    {
      to: ROUTES.HR.EVALUATIONS,
      label: 'Đánh Giá Cuối Kỳ',
      icon: Award,
      requiredPermission: 'INTERN_APPROVE',
      section: 'Quản Trị Nhân Sự',
      allowedRoles: ['HR'],
    },
    {
      to: ROUTES.HR.CONTRACTS,
      label: 'Quản Lý Hợp Đồng',
      icon: FileSignature,
      requiredPermission: 'CONTRACT_VIEW',
      section: 'Quản Trị Nhân Sự',
      allowedRoles: ['HR'],
    },
    {
      to: ROUTES.HR.REVIEW,
      label: 'Duyệt Tài Liệu & CV',
      icon: FileCheck2,
      requiredPermission: 'DOCUMENT_REVIEW',
      section: 'Quản Trị Nhân Sự',
      allowedRoles: ['HR'],
    },

    // 3. Phân hệ Người Hướng Dẫn (CHỈ MENTOR)
    {
      to: ROUTES.MENTOR.DASHBOARD,
      label: 'Bảng Điều Khiển Mentor',
      icon: LayoutDashboard,
      requiredPermission: 'INTERN_VIEW_OWN',
      section: 'Người Hướng Dẫn',
      allowedRoles: ['MENTOR'],
    },
    {
      to: ROUTES.MENTOR.INTERNS,
      label: 'TTS Phụ Trách',
      icon: Users,
      requiredPermission: 'INTERN_VIEW_OWN',
      section: 'Người Hướng Dẫn',
      allowedRoles: ['MENTOR'],
    },
    {
      to: ROUTES.MENTOR.DOCUMENTS,
      label: 'Tài Liệu Hướng Dẫn',
      icon: FolderGit2,
      requiredPermission: 'MENTOR_VIEW_OWN_DOCS',
      section: 'Người Hướng Dẫn',
      allowedRoles: ['MENTOR'],
    },

    // 4. Phân hệ Thực Tập Sinh (CHỈ INTERN)
    {
      to: ROUTES.INTERN.DASHBOARD,
      label: 'Tiến Độ Thực Tập',
      icon: LayoutDashboard,
      requiredPermission: 'INTERN_VIEW_OWN_PROFILE',
      section: 'Góc Thực Tập Sinh',
      allowedRoles: ['INTERN', 'USER'],
    },
    {
      to: ROUTES.INTERN.DOCUMENTS,
      label: 'Quản Lý Tài Liệu',
      icon: FileText,
      requiredPermission: 'INTERN_VIEW_OWN_DOCUMENTS',
      section: 'Góc Thực Tập Sinh',
      allowedRoles: ['INTERN', 'USER'],
    },
  ];

  // Lọc động chuẩn Security & Domain Boundaries:
  // Mỗi vai trò có Domain riêng biệt: ADMIN chỉ xem phân hệ quản trị, HR chỉ xem phân hệ nhân sự, Mentor/Intern tương ứng
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      if (!role || !item.allowedRoles.includes(role)) {
        return false;
      }
    }
    if (!item.requiredPermission) return true;
    if (role === 'ADMIN') return true;
    return hasPermission(item.requiredPermission);
  });

  // Nhóm các link theo Section để phân tách rõ ràng
  const sections = Array.from(new Set(visibleNavItems.map((item) => item.section)));

  const roleLabels: Record<string, { title: string; color: string }> = {
    ADMIN: { title: 'Quản Trị Viên', color: '#ef4444' },
    HR: { title: 'Chuyên Viên HR', color: '#3b82f6' },
    MENTOR: { title: 'Người Hướng Dẫn', color: '#10b981' },
    INTERN: { title: 'Thực Tập Sinh', color: '#8b5cf6' },
    USER: { title: 'Thực Tập Sinh', color: '#8b5cf6' },
  };

  const currentRoleInfo = role ? roleLabels[role] || { title: role, color: '#6b7280' } : null;

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${
          isCollapsed ? styles.sidebarCollapsed : ''
        }`}
      >
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo} title="InternHub Enterprise Portal">
            <Building2 size={22} />
          </div>

          {!isCollapsed && (
            <div className={styles.brandInfo}>
              <h1 className={styles.brandName}>
                Intern<span className={styles.brandHighlight}>Hub</span>
              </h1>
              <p className={styles.brandSub}>Enterprise Portal</p>
            </div>
          )}

          {/* Nút thu gọn / mở rộng Sidebar trên Desktop */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={styles.desktopCollapseBtn}
              title={isCollapsed ? 'Mở rộng thanh điều hướng (Ctrl+B)' : 'Thu gọn thanh điều hướng (Ctrl+B)'}
              aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}

          {/* Nút đóng trên Mobile */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={styles.mobileCloseBtn}
              aria-label="Đóng thanh điều hướng"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Content phân theo từng Nhóm Nghiệp Vụ */}
        <div className={styles.navContainer}>
          <nav className={styles.nav} aria-label="Main Navigation">
            {sections.map((sectionName) => {
              const itemsInSection = visibleNavItems.filter((i) => i.section === sectionName);

              return (
                <div key={sectionName} className={styles.navSectionGroup}>
                  {!isCollapsed && (
                    <div className={styles.navHeading}>{sectionName}</div>
                  )}

                  <div className={styles.sectionItems}>
                    {itemsInSection.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === ROUTES.ROOT}
                          className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                          }
                          title={isCollapsed ? item.label : undefined}
                        >
                          <span className={styles.navIcon}>
                            <Icon size={18} />
                          </span>
                          {!isCollapsed && (
                            <span className={styles.navLabel}>{item.label}</span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout - Tích hợp ngang hàng chuẩn SaaS */}
        <div className={styles.userSection}>
          <div className={`${styles.userRow} ${isCollapsed ? styles.userRowCollapsed : ''}`}>
            <NavLink
              to={ROUTES.PROFILE}
              className={styles.userProfileLink}
              title={isCollapsed ? (user?.fullName || user?.username || 'Hồ sơ cá nhân') : 'Xem hồ sơ cá nhân'}
            >
              <img
                src={getAvatarUrl(user || undefined)}
                alt="Avatar"
                className={styles.userAvatar}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAvatarUrl(undefined);
                }}
              />
              {!isCollapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.fullName || user?.username}</span>
                  {currentRoleInfo && (
                    <span
                      className={styles.userRoleBadge}
                      style={{
                        backgroundColor: `${currentRoleInfo.color}15`,
                        color: currentRoleInfo.color,
                        borderColor: `${currentRoleInfo.color}30`,
                      }}
                    >
                      {currentRoleInfo.title}
                    </span>
                  )}
                </div>
              )}
            </NavLink>

            <button
              type="button"
              onClick={() => void logout()}
              className={styles.logoutGhostBtn}
              title="Đăng xuất khỏi hệ thống"
              aria-label="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
