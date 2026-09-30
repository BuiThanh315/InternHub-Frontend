import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { formatDate } from '../../../../utils/formatters';
import type { StaffProfessionalTabProps } from './StaffProfessionalTab.types';
import styles from './StaffProfessionalTab.module.css';

export const StaffProfessionalTab: React.FC<StaffProfessionalTabProps> = ({
  user,
  role,
}) => {
  const getRoleTitle = () => {
    switch (role) {
      case 'ADMIN':
        return 'Quản Trị Hệ Thống';
      case 'HR':
        return 'Chuyên Viên Quản Trị Nhân Sự';
      case 'MENTOR':
        return 'Cán Bộ Hướng Dẫn Kỹ Thuật (Mentor)';
      default:
        return 'Cán Bộ Nhân Sự';
    }
  };

  return (
    <div className={styles.tabCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Thông Tin Biên Chế & Công Tác Doanh Nghiệp</h3>
        <p className={styles.cardSubtitle}>
          Hồ sơ chức vụ, phòng ban và phạm vi trách nhiệm được phân công trong hệ thống
        </p>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Vai trò hệ thống</span>
          <span className={styles.value}>{getRoleTitle()}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Phòng ban / Bộ phận trực thuộc</span>
          <span className={styles.value}>
            {user?.department || <em className={styles.emptyValue}>Trung tâm Phát triển Nguồn nhân lực</em>}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Chức danh chuyên môn</span>
          <span className={styles.value}>
            {user?.position || <em className={styles.emptyValue}>Cán bộ quản lý chương trình</em>}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Thời gian tiếp nhận tài khoản</span>
          <span className={styles.value}>
            {user?.createdAt ? formatDate(user.createdAt) : <em className={styles.emptyValue}>Chưa ghi nhận</em>}
          </span>
        </div>
      </div>

      <div className={styles.noticeBlock}>
        <Info size={18} className={styles.noticeIcon} />
        <span>
          Thông tin phòng ban và chức danh công tác được chỉ định và quản lý tập trung bởi Quản trị viên (Admin). Nếu cần điều chỉnh, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.
        </span>
      </div>
    </div>
  );
};

export default StaffProfessionalTab;
