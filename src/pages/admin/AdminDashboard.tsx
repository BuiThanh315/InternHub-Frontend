import React, { useState } from 'react';
import { Users, Database, FileText } from 'lucide-react';

import { Header } from '../../components/layout/Header';
import {
  AdminMetricsGrid,
  AdminUserTab,
  AdminBackupTab,
  AdminAuditTab,
} from './components';
import type { User } from '../../types';
import styles from './AdminDashboard.module.css';

type AdminTab = 'users' | 'backups' | 'audit-logs';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <Header
        title="Quản Trị Hệ Thống (Admin Portal)"
        subtitle="Giám sát hệ sinh thái Microservices, quản lý tài khoản và theo dõi nhật ký kiểm toán thời gian thực"
      />

      {/* Metric KPI Cards & Microservices Status */}
      <AdminMetricsGrid users={users} />

      {/* Main Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          onClick={() => setActiveTab('users')}
          className={`${styles.tabBtn} ${
            activeTab === 'users' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <Users size={16} /> Quản Lý Người Dùng
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`${styles.tabBtn} ${
            activeTab === 'backups' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <Database size={16} /> Sao Lưu Dữ Liệu (TM-8)
        </button>

        <button
          onClick={() => setActiveTab('audit-logs')}
          className={`${styles.tabBtn} ${
            activeTab === 'audit-logs' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <FileText size={16} /> Nhật Ký Hoạt Động (TM-9)
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'users' && <AdminUserTab onUsersChange={setUsers} />}
      {activeTab === 'backups' && <AdminBackupTab />}
      {activeTab === 'audit-logs' && <AdminAuditTab />}
    </div>
  );
};

export default AdminDashboard;
