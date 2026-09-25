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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
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
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--sidebar-text)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      borderRight: '1px solid #1e293b',
      zIndex: 40,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px var(--primary-glow)',
        }}>
          <Building2 size={22} />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.2rem',
            color: '#fff',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Intern<span style={{ color: '#818cf8' }}>Hub</span>
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>Enterprise Portal</p>
        </div>
      </div>

      {/* User Role Card */}
      {user && (
        <div style={{
          margin: '1.25rem 1rem',
          padding: '0.85rem',
          borderRadius: '10px',
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: currentRoleInfo?.color || '#4f46e5',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              color: '#fff',
              fontSize: '0.825rem',
              fontWeight: 600,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user.fullName || user.username}
            </p>
            <span style={{
              display: 'inline-block',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: currentRoleInfo?.color,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {currentRoleInfo?.title}
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <p style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          padding: '0.5rem 0.75rem',
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          Chức Năng Chính
        </p>

        {getNavLinks().map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#fff' : '#94a3b8',
                backgroundColor: isActive ? '#4f46e5' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={16} />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
};
