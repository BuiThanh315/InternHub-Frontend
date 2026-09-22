import React from 'react';
import { User as UserIcon } from 'lucide-react';
import type { InternProfile } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import styles from './InternProfileCard.module.css';

interface InternProfileCardProps {
  profile: InternProfile;
}

export const InternProfileCard: React.FC<InternProfileCardProps> = ({ profile }) => {
  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'INTERNING':
        return 'badge-success';
      case 'APPROVED':
        return 'badge-info';
      case 'COMPLETED':
        return 'badge-neutral';
      case 'REJECTED':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className={styles.grid}>
      {/* Profile Info */}
      <div className="card">
        <div className={styles.header}>
          <h4 className={styles.title}>Thông Tin Cá Nhân & Học Vấn</h4>
          <span className={`badge ${getBadgeClass(profile.status)}`}>{profile.status}</span>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            Mã Thực Tập Sinh: <span className={styles.codeHighlight}>{profile.internCode}</span>
          </div>
          <div className={styles.infoItem}>
            Họ và Tên: <strong>{profile.fullName}</strong>
          </div>
          <div className={styles.infoItem}>
            Email: <strong>{profile.email}</strong>
          </div>
          <div className={styles.infoItem}>
            Điện thoại: <strong>{profile.phone}</strong>
          </div>
          <div className={styles.infoItem}>
            Trường: <strong>{profile.university}</strong>
          </div>
          <div className={styles.infoItem}>
            Chuyên ngành: <strong>{profile.major}</strong>
          </div>
          <div className={styles.infoItem}>
            Vị trí ứng tuyển:{' '}
            <strong style={{ color: '#3b82f6' }}>{profile.appliedPosition || 'Chưa xếp'}</strong>
          </div>
          <div className={styles.infoItem}>
            Niên khóa: <strong>{profile.academicYear || '—'}</strong>
          </div>
        </div>
      </div>

      {/* Mentor Info */}
      <div className={`card ${styles.mentorCard}`}>
        <div className={styles.mentorHeader}>
          <UserIcon size={20} color="#10b981" />
          <h4 className={styles.mentorTitle}>Người Hướng Dẫn Kỹ Thuật (Mentor)</h4>
        </div>
        <p className={styles.mentorText}>
          Họ và tên: <strong>{profile.mentorName || 'Lê Hoàng Nam (Mentor)'}</strong>
        </p>
        <p className={styles.mentorText}>
          Email hỗ trợ: <strong>nam.le@internhub.com</strong>
        </p>
        <p className={styles.mentorText} style={{ margin: 0 }}>
          Thời gian thực tập: <strong>{formatDate(profile.startDate)}</strong> đến{' '}
          <strong>{formatDate(profile.endDate || '2026-06-30')}</strong>
        </p>
      </div>
    </div>
  );
};
