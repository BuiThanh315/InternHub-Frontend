import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { navConfig, type Role } from '../../lib/permissions';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * Sidebar - App Shell navigation adhering to docs/spec.md section 2.2:
 * - Desktop: 236px fixed width
 * - Tablet: Collapses to 64px icon-rail
 * - Items mapped from navConfig[role] in lib/permissions.ts
 * - Active: bg --primary-soft, text --primary, font-weight 600
 * - User block at the bottom with avatar fallback & logout
 */
export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user, role, logout } = useAuth();
  const currentRole = (role as Role) || 'INTERN';
  const navItems = navConfig[currentRole] || navConfig.INTERN;

  const roleBadgeMap: Record<string, { label: string; bg: string; color: string }> = {
    ADMIN: { label: 'Admin', bg: 'var(--danger-soft)', color: 'var(--danger)' },
    HR: { label: 'HR Dept', bg: 'var(--primary-soft)', color: 'var(--primary)' },
    MENTOR: { label: 'Mentor', bg: 'var(--success-soft)', color: 'var(--success)' },
    INTERN: { label: 'Intern', bg: 'var(--info-soft)', color: 'var(--info)' },
  };

  const roleInfo = roleBadgeMap[currentRole] || roleBadgeMap.INTERN;

  // Fallback avatar initial
  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col justify-between border-r border-border transition-all duration-300 z-20',
        'bg-surface text-text-1',
        collapsed ? 'w-16' : 'w-[236px]'
      )}
    >
      {/* Brand & Logo Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-border-soft gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            IH
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight text-text-1 truncate leading-tight">
                Intern<span className="text-primary">Hub</span>
              </h1>
              <p className="text-[11px] text-text-3 truncate font-medium">
                Enterprise Portal
              </p>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider">
              Menu Chính
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-soft text-primary font-semibold shadow-xs'
                      : 'text-text-2 hover:bg-surface-2 hover:text-text-1',
                    collapsed && 'justify-center px-2'
                  )
                }
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-border-soft bg-surface-2">
        <div className="flex items-center gap-2.5">
          {/* Avatar with fallback */}
          <div className="w-9 h-9 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-border">
            {userInitial}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-text-1 truncate block">
                  {user?.fullName || 'Người Dùng'}
                </span>
              </div>
              <span
                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5"
                style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
              >
                {roleInfo.label}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            title="Đăng xuất"
            className="p-1.5 rounded-md text-[var(--text-3)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
