import React from 'react';
import { Edit3 } from 'lucide-react';
import { Button } from '../../../../components/common';
import { formatDate } from '../../../../utils/formatters';
import type { PersonalInfoTabProps } from './PersonalInfoTab.types';
import styles from './PersonalInfoTab.module.css';

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  user,
  onOpenEditModal,
}) => {
  const getGenderLabel = (g?: string) => {
    switch (g) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
        return 'Khác';
      default:
        return 'Chưa cập nhật';
    }
  };

  return (
    <div className={styles.tabCard}>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <h3 className={styles.cardTitle}>Thông Tin Cá Nhân & Liên Hệ</h3>
          <p className={styles.cardSubtitle}>
            Thông tin định danh của tài khoản dùng trong giao tiếp và thủ tục nghiệp vụ
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenEditModal}
          leftIcon={<Edit3 size={15} />}
        >
          Chỉnh Sửa Thông Tin
        </Button>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Họ và tên</span>
          <span className={styles.value}>{user?.fullName || <em className={styles.emptyValue}>Chưa cập nhật</em>}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Email định danh (Khóa cố định)</span>
          <span className={styles.value}>{user?.email || <em className={styles.emptyValue}>Chưa cập nhật</em>}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Số điện thoại</span>
          <span className={styles.value}>
            {user?.phone || user?.phoneNumber || <em className={styles.emptyValue}>Chưa cập nhật</em>}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Ngày sinh</span>
          <span className={styles.value}>
            {user?.dateOfBirth ? formatDate(user.dateOfBirth) : <em className={styles.emptyValue}>Chưa cập nhật</em>}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Giới tính</span>
          <span className={styles.value}>{getGenderLabel(user?.gender)}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Địa chỉ liên lạc</span>
          <span className={styles.value}>{user?.address || <em className={styles.emptyValue}>Chưa cập nhật</em>}</span>
        </div>
      </div>

      {user?.bio && (
        <div className={styles.bioBlock}>
          <span className={styles.label}>Giới thiệu ngắn (Bio)</span>
          <p className={styles.bioContent}>{user.bio}</p>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;
