import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

/**
 * MainLayout - App Shell according to docs/spec.md section 2:
 * ┌────────────┬──────────────────────────────────────────┐
 * │            │  Topbar (search · bell · avatar)         │
 * │  Sidebar   ├──────────────────────────────────────────┤
 * │  236px     │  Main content (scrollable, padding 24px) │
 * └────────────┴──────────────────────────────────────────┘
 */
export const MainLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg text-text-1 font-sans antialiased">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-[236px] h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onToggleCollapse={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
