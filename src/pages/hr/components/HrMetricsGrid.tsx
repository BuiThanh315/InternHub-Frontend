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

      <div className={`card ${styles.metricCard} ${pendingInterns > 0 ? styles.metricCardActivePending : ''}`}>
        <div className={`${styles.iconWrapper} ${styles.iconPending} ${pendingInterns === 0 ? styles.iconZero : ''}`}>
          <Clock size={24} />
        </div>
        <div>
          <p className={styles.label}>Chờ Tiếp Nhận</p>
          <h3 className={`${styles.value} ${pendingInterns === 0 ? styles.valueZero : styles.valuePending}`}>
            {pendingInterns}
          </h3>
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

      <div className={`card ${styles.metricCard} ${pendingDocuments > 0 ? styles.metricCardActiveDocs : ''}`}>
        <div className={`${styles.iconWrapper} ${styles.iconDocs} ${pendingDocuments === 0 ? styles.iconZero : ''}`}>
          <FileCheck2 size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <p className={styles.label}>CV Chờ Thẩm Định</p>
            {pendingDocuments > 0 && <span className={styles.actionPulse} />}
          </div>
          <h3 className={`${styles.value} ${pendingDocuments === 0 ? styles.valueZero : styles.valueDocs}`}>
            {pendingDocuments}
          </h3>
        </div>
      </div>
    </div>
  );
};
