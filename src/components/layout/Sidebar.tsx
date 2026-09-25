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
  Building2,
  FileText,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, role, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
          { to: '/admin/system', label: 'Giám Sát Hệ Thống', icon: ShieldCheck },
        ];
      case 'HR':
        return [
          { to: '/hr/dashboard', label: 'Bảng Điều Khiển HR', icon: LayoutDashboard },
          { to: '/hr/programs', label: 'Chương Trình Thực Tập', icon: FolderGit2 },
          { to: '/hr/interns', label: 'Hồ Sơ Thực Tập Sinh', icon: GraduationCap },
          { to: '/hr/review', label: 'Duyệt Tài Liệu & CV', icon: FileCheck2 },
        ];
      case 'MENTOR':
        return [
          { to: '/mentor/dashboard', label: 'Bảng Điều Khiển Mentor', icon: LayoutDashboard },
          { to: '/mentor/interns', label: 'TTS Phụ Trách', icon: Users },
          { to: '/mentor/documents', label: 'Tài Liệu Hướng Dẫn', icon: FolderGit2 },
        ];
      case 'INTERN':
      default:
        return [
          { to: '/intern/dashboard', label: 'Tiến Độ Thực Tập', icon: LayoutDashboard },
          { to: '/intern/documents', label: 'Hồ Sơ & Tài Liệu', icon: FileText },
        ];
    }
  };

  const roleLabels: Record<string, { title: string; color: string }> = {
    ADMIN: { title: 'Quản Trị Viên', color: '#ef4444' },
    HR: { title: 'Chuyên Viên HR', color: '#3b82f6' },
    MENTOR: { title: 'Người Hướng Dẫn', color: '#10b981' },
    INTERN: { title: 'Thực Tập Sinh', color: '#8b5cf6' },
  };

  const currentRoleInfo = role ? roleLabels[role] || { title: role, color: '#6b7280' } : null;

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <Building2 size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 className={styles.brandName}>
              Intern<span className={styles.brandHighlight}>Hub</span>
            </h1>
            <p className={styles.brandSub}>Enterprise Portal</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Đóng thanh điều hướng"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Role Card */}
        {user && (
          <div className={styles.userCard}>
            <div
              className={styles.userAvatar}
              style={{ backgroundColor: currentRoleInfo?.color || 'var(--primary)' }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>
                {user.fullName || user.username}
              </p>
              <span
                className={styles.userRole}
                style={{ color: currentRoleInfo?.color }}
              >
                {currentRoleInfo?.title}
              </span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className={styles.nav}>
          <p className={styles.navHeading}>Chức Năng Chính</p>

          {getNavLinks().map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className={styles.logoutContainer}>
          <button type="button" onClick={logout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
