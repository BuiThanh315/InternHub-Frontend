import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, GraduationCap, AlertCircle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/common';
import { internService } from '../../services/internService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import type { InternProfile, User as UserType } from '../../types';
import { InternProfileCard } from './components/InternProfileCard';
import styles from './InternDashboard.module.css';

export const InternProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InternProfile | null>(null);
  const [fullUser, setFullUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Tải thông tin tài khoản đầy đủ
      if (user?.userId) {
        try {
          const u = await userService.getUserById(user.userId);
          setFullUser(u);
        } catch (uErr) {
          console.warn('Lỗi tải thông tin user:', uErr);
        }
      }

      // 2. Lấy hồ sơ thực tập sinh đã lưu tương ứng từ phiên đăng nhập (tránh gọi GET /api/interns gây 403)
      const currentProfile = internService.getLocalProfile(user?.userId);
      setProfile(currentProfile);
    } catch (err: any) {
      console.error('Lỗi tải thông tin hồ sơ Intern:', err);
      setErrorMessage(err.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayName = fullUser?.fullName || user?.fullName || user?.username || 'Thực Tập Sinh';
  const displayEmail = fullUser?.email || user?.email || (user?.username?.includes('@') ? user.username : '');
  const displayPhone = fullUser?.phone || fullUser?.phoneNumber || user?.phone || user?.phoneNumber || '';
  const displayAddress = fullUser?.address || user?.address;

  return (
    <div className="animate-fade-in">
      <Header
        title="Hồ Sơ Cá Nhân & Định Danh Thực Tập Sinh"
        subtitle="Quản lý thông tin tài khoản đăng nhập, thông tin liên lạc và chi tiết hồ sơ thực tập"
      />

      {loading ? (
        <div className={styles.skeletonContainer}>
          <Skeleton variant="card" height="200px" />
          <Skeleton variant="card" height="300px" />
        </div>
      ) : (
        <div className={styles.dashboardContainer}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#ef4444',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* User Account Overview Card */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-default, #e2e8f0)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--text-main, #0f172a)',
                      margin: 0,
                    }}
                  >
                    {displayName}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: 'var(--primary-light, #eef2ff)',
                      color: 'var(--primary, #4338ca)',
                      border: '1px solid rgba(79, 70, 229, 0.25)',
                    }}
                  >
                    Tài khoản: @{user?.username}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    Vai trò: Thực Tập Sinh
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    marginTop: '0.75rem',
                    flexWrap: 'wrap',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary, #475569)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={15} style={{ color: 'var(--primary, #4f46e5)' }} />
                    {displayEmail || 'Chưa cập nhật email'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={15} style={{ color: '#10b981' }} />
                    {displayPhone || 'Chưa cập nhật SĐT'}
                  </span>
                  {displayAddress && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} style={{ color: '#f59e0b' }} />
                      {displayAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Internship Profile Detail */}
          {profile ? (
            <InternProfileCard profile={profile} />
          ) : (
            <div
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'var(--primary-light, #eef2ff)',
                  color: 'var(--primary, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <GraduationCap size={26} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', marginBottom: '0.5rem' }}>
                Chưa Có Hồ Sơ Thực Tập Doanh Nghiệp
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #475569)', maxWidth: '28rem', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                Tài khoản của bạn đã được đăng ký thành công nhưng chưa gắn với đơn ứng tuyển thực tập nào.
              </p>
              <Link
                to={ROUTES.INTERN.APPLY}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '8px',
                  background: 'var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                }}
              >
                <span>Nộp Hồ Sơ Ứng Tuyển Ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InternProfilePage;
