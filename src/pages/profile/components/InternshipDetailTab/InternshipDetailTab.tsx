import React from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InternProfileCard } from '../../../intern/components/InternProfileCard';
import { ROUTES } from '../../../../constants/routes';
import type { InternshipDetailTabProps } from './InternshipDetailTab.types';
import styles from './InternshipDetailTab.module.css';

export const InternshipDetailTab: React.FC<InternshipDetailTabProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIconWrapper}>
          <GraduationCap size={26} />
        </div>
        <h4 className={styles.emptyTitle}>
          Chưa Có Hồ Sơ Thực Tập Doanh Nghiệp
        </h4>
        <p className={styles.emptyDesc}>
          Tài khoản của bạn đã được đăng ký thành công nhưng chưa liên kết với đợt thực tập nào.
        </p>
        <Link to={ROUTES.INTERN.APPLY} className={styles.applyButton}>
          <span>Nộp Đơn Ứng Tuyển Ngay</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // Tái sử dụng trực tiếp InternProfileCard ở chế độ Read-only 100%
  return <InternProfileCard profile={profile} />;
};

export default InternshipDetailTab;
