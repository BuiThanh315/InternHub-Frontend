import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
  onToggleSidebar?: () => void;
  pendingTasksCount?: number;
  onSearch?: (query: string) => void;
}

/**
 * Topbar - App Shell Header adhering to docs/spec.md section 2.3:
 * - Search bar toàn cục bên trái (debounce 300ms, quick jump)
 * - Notification bell với dot đỏ khi có việc chưa đọc
 * - Avatar user bên phải
 * - Sticky, z-index hợp lý
 */
export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  pendingTasksCount = 3,
  onSearch,
}) => {
  const { user, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce 300ms for global search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-10 h-16 w-full bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle + Quick Jump Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-text-2 hover:bg-surface-2 transition-colors md:hidden"
            title="Toggle navigation"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="relative w-full flex items-center">
          <Search
            size={16}
            className="absolute left-3.5 text-text-3 pointer-events-none z-10"
          />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh theo tên, email, chuyên ngành..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-10 pr-4 py-2 text-sm rounded-lg bg-bg border border-border text-text-1 placeholder:text-text-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-2 rounded-lg text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] transition-colors relative"
            title="Thông báo"
          >
            <Bell size={18} />
            {pendingTasksCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)] animate-pulse" />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border-soft)]" />

        {/* User preview */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs flex items-center justify-center border border-[var(--border)] select-none">
            {userInitial}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-[var(--text-1)] block leading-none">
              {user?.fullName || 'Người dùng'}
            </span>
            <span className="text-[10px] text-[var(--text-3)] block mt-0.5 font-medium">
              {role || 'Thực tập sinh'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
