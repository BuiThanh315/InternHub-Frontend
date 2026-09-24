import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, WifiOff, Terminal, Menu, Sun, Moon } from 'lucide-react';
import { checkBackendHealth } from '../../services/api';
import { ApiConsoleModal } from '../common';
import { useLayout } from '../../layouts/MainLayout';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Bảng Điều Khiển Doanh Nghiệp',
  subtitle,
  onToggleSidebar,
}) => {
  const layout = useLayout();
  const handleToggle = onToggleSidebar || layout.toggleSidebar;
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showApiConsole, setShowApiConsole] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    );
  });

  const checkHealth = async () => {
    const res = await checkBackendHealth();
    setBackendStatus(res.isConnected ? 'online' : 'offline');
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Đồng bộ theme khi khởi động
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const getStatusClass = () => {
    if (backendStatus === 'online') return styles.statusOnline;
    if (backendStatus === 'offline') return styles.statusOffline;
    return styles.statusChecking;
  };

  return (
    <header className={styles.header}>
      {/* Left section: Hamburger button & Title */}
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={handleToggle}
          aria-label="Mở thanh điều hướng"
        >
          <Menu size={22} />
        </button>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      {/* Right controls: Theme Switcher, System Status & API Console */}
      <div className={styles.rightControls}>
        {/* Dark/Light Mode Switcher */}
        <button
          type="button"
          className={styles.themeToggleBtn}
          onClick={toggleTheme}
          title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          aria-label="Chuyển chế độ giao diện"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Backend Gateway Status Indicator */}
        <div
          onClick={checkHealth}
          className={`${styles.statusIndicator} ${getStatusClass()}`}
          title="Nhấp để kiểm tra lại kết nối Backend Microservices"
          role="button"
          tabIndex={0}
        >
          {backendStatus === 'online' ? (
            <>
              <CheckCircle size={14} />
              <span>Backend Online (Port 8080)</span>
            </>
          ) : backendStatus === 'offline' ? (
            <>
              <WifiOff size={14} />
              <span>Backend Offline</span>
            </>
          ) : (
            <>
              <Activity size={14} className="animate-spin" />
              <span>Đang kiểm tra...</span>
            </>
          )}
        </div>

        {/* API Console Launcher Button */}
        <button
          type="button"
          className={styles.apiConsoleBtn}
          onClick={() => setShowApiConsole(true)}
          title="Mở Bảng Điều Khiển & Thao Tác Trực Tiếp Toàn Bộ API Backend"
        >
          <Terminal size={15} />
          <span>API Console</span>
        </button>
      </div>

      {/* Live API Console Modal */}
      <ApiConsoleModal isOpen={showApiConsole} onClose={() => setShowApiConsole(false)} />
    </header>
  );
};

export default Header;
