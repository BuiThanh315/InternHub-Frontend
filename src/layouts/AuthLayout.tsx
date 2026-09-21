import React from 'react';
import { Outlet } from 'react-router-dom';
import { Building2, CheckCircle2, Users, Layers } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0b1120',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        right: '-100px',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Left Column: Branding Showcase */}
      <div style={{
        flex: 1.2,
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px var(--primary-glow)',
          }}>
            <Building2 size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              Intern<span style={{ color: '#818cf8' }}>Hub</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Enterprise Internship Management Ecosystem
            </p>
          </div>
        </div>

        {/* Hero Narrative */}
        <div style={{ maxWidth: '540px', margin: '3rem 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}>
            <Layers size={14} />
            <span>Nền Tảng Microservices Chuẩn Doanh Nghiệp</span>
          </div>

          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: '#ffffff',
          }}>
            Số Hóa Toàn Diện Quy Trình Thực Tập Doanh Nghiệp
          </h2>

          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Kết nối liền mạch giữa Quản trị viên, Phòng Nhân sự, Người hướng dẫn kỹ thuật và Thực tập sinh trên một nền tảng đồng nhất, minh bạch và hiệu quả cao.
          </p>

          {/* Key Advantages Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{
              padding: '1.1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', color: '#818cf8' }}>
                <CheckCircle2 size={18} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Số Hóa Hồ Sơ & CV</h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                Tiếp nhận hồ sơ online, lưu trữ và thẩm định tài liệu trực tuyến (TM-4, TM-5).
              </p>
            </div>

            <div style={{
              padding: '1.1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', color: '#34d399' }}>
                <Users size={18} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Phân Quyền Đa Vai Trò</h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                Không gian làm việc chuyên biệt cho Admin, HR, Mentor và Thực tập sinh.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          fontSize: '0.78rem',
          color: '#64748b',
        }}>
          <span>© 2026 InternHub. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Spring Cloud Microservices</span>
            <span>React & Vite Enterprise</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Outlet */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        position: 'relative',
        zIndex: 1,
        backgroundColor: '#0f172a',
      }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
