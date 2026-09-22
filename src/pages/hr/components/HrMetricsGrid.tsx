import React from 'react';
import { GraduationCap, Clock, CheckCircle2, FileCheck2 } from 'lucide-react';
import styles from './HrMetricsGrid.module.css';

interface HrMetricsGridProps {
  totalInterns: number;
  pendingInterns: number;
  interningInterns: number;
  pendingDocuments: number;
}

export const HrMetricsGrid: React.FC<HrMetricsGridProps> = ({
  totalInterns,
  pendingInterns,
  interningInterns,
  pendingDocuments,
}) => {
  return (
    <div className={styles.grid}>
      <div className={`card ${styles.metricCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconTotal}`}>
          <GraduationCap size={24} />
        </div>
        <div>
          <p className={styles.label}>Tổng Hồ Sơ</p>
          <h3 className={styles.value}>{totalInterns}</h3>
        </div>
      </div>

      <div className={`card ${styles.metricCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconPending}`}>
          <Clock size={24} />
        </div>
        <div>
          <p className={styles.label}>Chờ Tiếp Nhận</p>
          <h3 className={styles.value}>{pendingInterns}</h3>
        </div>
      </div>

      <div className={`card ${styles.metricCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconInterning}`}>
          <CheckCircle2 size={24} />
        </div>
        <div>
          <p className={styles.label}>Đang Thực Tập</p>
          <h3 className={styles.value}>{interningInterns}</h3>
        </div>
      </div>

      <div className={`card ${styles.metricCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconDocs}`}>
          <FileCheck2 size={24} />
        </div>
        <div>
          <p className={styles.label}>CV Chờ Thẩm Định</p>
          <h3 className={styles.value}>{pendingDocuments}</h3>
        </div>
      </div>
    </div>
  );
};
