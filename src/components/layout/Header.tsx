import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { role, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickSwitch = (newRole: 'admin' | 'hr' | 'mentor' | 'intern') => {
    demoLogin(newRole);
    switch (newRole) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'hr':
        navigate('/hr/dashboard');
        break;
      case 'mentor':
        navigate('/mentor/dashboard');
        break;
      case 'intern':
        navigate('/intern/dashboard');
        break;
    }
  };

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

      {/* Right controls: Demo Role Switcher & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Backend Gateway Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          color: 'var(--success)',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          <Activity size={14} />
          <span>API Gateway : 8080</span>
        </div>

        {/* Quick Demo Switcher Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--border-subtle)',
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            paddingRight: '0.4rem',
          }}>
            <Sparkles size={13} color="#f59e0b" />
            <span>Chuyển Vai Trò:</span>
          </div>

          {(['admin', 'hr', 'mentor', 'intern'] as const).map((r) => {
            const isCurrent = role?.toLowerCase() === r;
            return (
              <button
                key={r}
                onClick={() => handleQuickSwitch(r)}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isCurrent ? 'var(--primary)' : 'transparent',
                  color: isCurrent ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                  textTransform: 'uppercase',
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
