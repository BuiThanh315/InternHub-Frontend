import React from 'react';
import { Users, UserCheck, ShieldCheck, Clock, Server, Activity } from 'lucide-react';

import type { User } from '../../../types';
import styles from './AdminMetricsGrid.module.css';

interface AdminMetricsGridProps {
  users: User[];
}

const MICROSERVICES = [
  { name: 'API Gateway', port: '8080', status: 'Hoạt động tốt' },
  { name: 'Discovery Server (Eureka)', port: '8761', status: 'Sẵn sàng' },
  { name: 'Config Server', port: '8888', status: 'Đã nạp kho cấu hình' },
  { name: 'Employee Service', port: '8081', status: 'Đang kết nối DB' },
];

export const AdminMetricsGrid: React.FC<AdminMetricsGridProps> = ({ users }) => {
  const countByRole = (roleName: string) => users.filter((u) => u.role === roleName).length;

  return (
    <div className={styles.metricsContainer}>
      {/* Metric KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
            <Users size={24} />
          </div>
          <div>
            <p className={styles.kpiLabel}>Tổng Người Dùng</p>
            <h3 className={styles.kpiValue}>{users.length}</h3>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.iconWrapper} ${styles.iconHr}`}>
            <UserCheck size={24} />
          </div>
          <div>
            <p className={styles.kpiLabel}>Nhân Sự (HR)</p>
            <h3 className={styles.kpiValue}>{countByRole('HR')}</h3>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.iconWrapper} ${styles.iconMentor}`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className={styles.kpiLabel}>Người Hướng Dẫn</p>
            <h3 className={styles.kpiValue}>{countByRole('MENTOR')}</h3>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.iconWrapper} ${styles.iconIntern}`}>
            <Clock size={24} />
          </div>
          <div>
            <p className={styles.kpiLabel}>Thực Tập Sinh</p>
            <h3 className={styles.kpiValue}>{countByRole('INTERN')}</h3>
          </div>
        </div>
      </div>

      {/* Microservices Status Bar */}
      <div className={`card ${styles.servicesCard}`}>
        <div className={styles.servicesHeader}>
          <Server size={18} color="var(--primary)" />
          <h4 className={styles.servicesTitle}>Trạng Thái Cụm Microservices</h4>
        </div>
        <div className={styles.servicesGrid}>
          {MICROSERVICES.map((svc) => (
            <div key={svc.name} className={styles.serviceItem}>
              <div>
                <p className={styles.serviceName}>{svc.name}</p>
                <span className={styles.servicePort}>Cổng: {svc.port}</span>
              </div>
              <span className="badge badge-success">
                <Activity size={12} /> {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMetricsGrid;
