import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  GraduationCap,
  FolderGit2,
  LogOut,
  ShieldCheck,
  Shield,
  Building2,
  FileText,
  FileSignature,
  X,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  CalendarCheck,
  Kanban,
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

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, role, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
          { to: '/admin/roles', label: 'Phân Quyền & Vai Trò', icon: Shield },
          { to: '/admin/system', label: 'Giám Sát Hệ Thống', icon: ShieldCheck },
          { to: ROUTES.PROFILE, label: 'Hồ Sơ Quản Trị', icon: UserIcon },
        ];
      case 'HR':
        return [
          { to: '/hr/dashboard', label: 'Bảng Điều Khiển HR', icon: LayoutDashboard },
          { to: '/hr/programs', label: 'Chương Trình Thực Tập', icon: FolderGit2 },
          { to: '/hr/mentors', label: 'Quản Lý Mentor & Tải', icon: Users },
          { to: '/hr/interns', label: 'Hồ Sơ Thực Tập Sinh', icon: GraduationCap },
          { to: '/hr/contracts', label: 'Quản Lý Hợp Đồng', icon: FileSignature },
          { to: '/hr/review', label: 'Duyệt Tài Liệu & CV', icon: FileCheck2 },
          { to: ROUTES.PROFILE, label: 'Hồ Sơ Cá Nhân', icon: UserIcon },
        ];
      case 'MENTOR':
        return [
          { to: '/mentor/dashboard', label: 'Bảng Điều Khiển Mentor', icon: LayoutDashboard },
          { to: ROUTES.MENTOR.MISSIONS, label: 'Bảng Nhiệm Vụ & Giao Việc', icon: Kanban },
          { to: '/mentor/interns', label: 'TTS Phụ Trách', icon: Users },
          { to: '/mentor/documents', label: 'Tài Liệu Hướng Dẫn', icon: FolderGit2 },
          { to: ROUTES.PROFILE, label: 'Hồ Sơ Cá Nhân', icon: UserIcon },
        ];
      case 'INTERN':
      case 'USER':
      default:
        return [
          { to: ROUTES.INTERN.DASHBOARD, label: 'Tiến Độ Thực Tập', icon: LayoutDashboard },
          { to: ROUTES.INTERN.ATTENDANCE, label: 'Chấm Công & Chuyên Cần', icon: CalendarCheck },
          { to: ROUTES.INTERN.APPLY, label: 'Nộp Hồ Sơ Ứng Tuyển', icon: GraduationCap },
          { to: ROUTES.INTERN.DOCUMENTS, label: 'Quản Lý Tài Liệu', icon: FileText },
          { to: ROUTES.PROFILE, label: 'Hồ Sơ Cá Nhân', icon: UserIcon },
        ];
    }
  };

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
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.sidebarCollapsed : ''
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
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
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

        <div className={styles.navContainer}>
          {/* User Card */}
          {user && (
            <NavLink
              to={ROUTES.PROFILE}
              onClick={onClose}
              className={`${styles.userCard} ${isCollapsed ? styles.userCardCollapsed : ''}`}
              title={`Hồ sơ cá nhân: ${user.fullName || user.username} (${currentRoleInfo?.title})`}
              style={{ textDecoration: 'none' }}
            >
              <img
                src={getAvatarUrl(user)}
                alt={user.fullName || user.username}
                className={styles.userAvatar}
                style={{ objectFit: 'cover' }}
              />
              {!isCollapsed && (
                <div className={styles.userInfo}>
                  <p className={styles.userName} title={user.fullName || user.username}>
                    {user.fullName || user.username}
                  </p>
                  <span
                    className={styles.userRole}
                    style={{ color: currentRoleInfo?.color }}
                  >
                    {currentRoleInfo?.title}
                  </span>
                </div>
              )}
            </NavLink>
          )}

          {/* Navigation List */}
          <nav className={styles.nav}>
            {!isCollapsed && <p className={styles.navHeading}>Chức Năng Chính</p>}

            {getNavLinks().map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  title={isCollapsed ? link.label : undefined}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''} ${isCollapsed ? styles.navLinkCollapsed : ''
                    }`
                  }
                >
                  <Icon size={19} className={styles.navIcon} />
                  {!isCollapsed && <span className={styles.navLabel}>{link.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Footer */}
          <div className={styles.logoutContainer}>
            <button
              type="button"
              onClick={logout}
              className={`${styles.logoutBtn} ${isCollapsed ? styles.logoutBtnCollapsed : ''}`}
              title={isCollapsed ? 'Đăng Xuất tài khoản' : undefined}
            >
              <LogOut size={16} />
              {!isCollapsed && <span>Đăng Xuất</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
