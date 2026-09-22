import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, WifiOff, Terminal } from 'lucide-react';
import { checkBackendHealth } from '../../services/api';
import { ApiConsoleModal } from '../common';

export const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showApiConsole, setShowApiConsole] = useState(false);

  const checkHealth = async () => {
    const res = await checkBackendHealth();
    setBackendStatus(res.isConnected ? 'online' : 'offline');
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Title & Subtitle */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
      </div>

      {/* Right controls: System Status & API Console */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Backend Gateway Status Indicator */}
        <div
          onClick={checkHealth}
          title="Nhấp để kiểm tra lại kết nối Backend Microservices"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: backendStatus === 'online' ? 'var(--success-bg)' : backendStatus === 'offline' ? 'rgba(239, 68, 68, 0.1)' : 'var(--border-subtle)',
            border: `1px solid ${backendStatus === 'online' ? 'var(--success-border)' : backendStatus === 'offline' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-default)'}`,
            color: backendStatus === 'online' ? 'var(--success)' : backendStatus === 'offline' ? '#ef4444' : 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {backendStatus === 'online' ? (
            <>
              <CheckCircle size={14} />
              <span>Backend Online (Port 8080)</span>
            </>
          ) : backendStatus === 'offline' ? (
            <>
              <WifiOff size={14} />
              <span>Backend Offline (Mất kết nối)</span>
            </>
          ) : (
            <>
              <Activity size={14} className="animate-spin" />
              <span>Đang kiểm tra API...</span>
            </>
          )}
        </div>

        {/* API Console Launcher Button */}
        <button
          onClick={() => setShowApiConsole(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#818cf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
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
