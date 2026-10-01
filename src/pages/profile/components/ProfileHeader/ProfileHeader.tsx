import React from 'react';
import { Camera, Mail, Phone, MapPin } from 'lucide-react';
import { getAvatarUrl } from '../../../../utils/avatar';
import type { ProfileHeaderProps } from './ProfileHeader.types';
import styles from './ProfileHeader.module.css';

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  role,
  onOpenAvatarUpload,
}) => {
  const displayName = user?.fullName || 'Thành Viên';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || user?.phoneNumber || '';
  const displayAddress = user?.address || '';
  const avatarSrc = getAvatarUrl(user);

  const getRoleConfig = () => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Quản Trị Viên', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'HR':
        return { label: 'Chuyên Viên HR', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'MENTOR':
        return { label: 'Người Hướng Dẫn', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'INTERN':
      case 'USER':
      default:
        return { label: 'Thực Tập Sinh', bg: 'var(--primary-soft, #eef0ff)', color: 'var(--primary, #4f46e5)' };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div className={styles.headerCard}>
      <div className={styles.bannerDecor} />
      <div className={styles.profileInfoWrapper}>
        {/* Avatar với nút camera hover */}
        <div
          className={styles.avatarContainer}
          onClick={onOpenAvatarUpload}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenAvatarUpload();
            }
          }}
          title="Nhấp để thay đổi ảnh đại diện cá nhân"
          aria-label="Đổi ảnh đại diện"
        >
          <img
            src={avatarSrc}
            alt={`Ảnh đại diện của ${displayName}`}
            className={styles.avatarImage}
            loading="lazy"
          />
          <div className={styles.avatarOverlay}>
            <Camera size={20} className={styles.cameraIcon} />
            <span className={styles.overlayText}>Đổi ảnh</span>
          </div>
        </div>

        {/* Thông tin chính */}
        <div className={styles.mainInfo}>
          <div className={styles.nameRow}>
            <h2 className={styles.displayName}>{displayName}</h2>
            <span
              className={styles.roleBadge}
              style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}
            >
              {roleConfig.label}
            </span>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Đang Hoạt Động
            </span>
          </div>

          <div className={styles.metaRow}>
            {displayEmail && (
              <span className={styles.metaItem}>
                <Mail size={15} className={styles.metaIcon} />
                <span>{displayEmail}</span>
              </span>
            )}
            {displayPhone && (
              <span className={styles.metaItem}>
                <Phone size={15} className={styles.metaIcon} />
                <span>{displayPhone}</span>
              </span>
            )}
            {displayAddress && (
              <span className={styles.metaItem}>
                <MapPin size={15} className={styles.metaIcon} />
                <span>{displayAddress}</span>
              </span>
            )}
          </div>

          {/* Dòng Bio ngắn nếu có */}
          {user?.bio && (
            <p className={styles.bioText}>"{user.bio}"</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
