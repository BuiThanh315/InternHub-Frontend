import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

import styles from './RegisterSuccessCard.module.css';

interface RegisterSuccessCardProps {
  internCode: string;
  name: string;
}

export const RegisterSuccessCard: React.FC<RegisterSuccessCardProps> = ({
  internCode,
  name,
}) => {
  return (
    <div className={styles.successCard}>
      <div className={styles.iconWrapper}>
        <CheckCircle2 size={36} />
      </div>

      <h3 className={styles.title}>Nộp Hồ Sơ Thành Công!</h3>
      <p className={styles.description}>
        Hồ sơ ứng tuyển của <strong>{name}</strong> đã được lưu trên hệ thống InternHub.
      </p>

      <div className={styles.codeBox}>
        <span className={styles.codeLabel}>Mã Thực Tập Sinh Của Bạn</span>
        <div className={styles.codeValue}>{internCode}</div>
        <p className={styles.codeHint}>
          (Hãy lưu lại mã này để tra cứu và nộp thêm tài liệu thẩm định)
        </p>
      </div>

      <div className={styles.actionRow}>
        <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span>Về Trang Đăng Nhập Để Tiếp Tục</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default RegisterSuccessCard;
