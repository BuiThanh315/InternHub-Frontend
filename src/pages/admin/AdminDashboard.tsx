import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Database, FileText, Shield } from 'lucide-react';

import { Header } from '../../components/layout/Header';
import {
  AdminMetricsGrid,
  AdminUserTab,
  AdminRoleTab,
  AdminBackupTab,
  AdminAuditTab,
} from './components';
import type { User } from '../../types';
import styles from './AdminDashboard.module.css';

type AdminTab = 'users' | 'roles' | 'backups' | 'audit-logs';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (location.pathname.includes('/roles')) return 'roles';
    if (location.pathname.includes('/system')) return 'backups';
    return 'users';
  });
  const [users, setUsers] = useState<User[]>([]);

  // Đồng bộ tab khi URL route thay đổi từ Sidebar
  useEffect(() => {
    if (location.pathname.includes('/roles')) {
      setActiveTab('roles');
    } else if (location.pathname.includes('/system')) {
      setActiveTab('backups');
    } else if (location.pathname.includes('/users')) {
      setActiveTab('users');
    }
  }, [location.pathname]);

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
          type="button"
          onClick={() => setActiveTab('users')}
          className={`${styles.tabBtn} ${
            activeTab === 'users' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <Users size={16} /> Quản Lý Người Dùng
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`${styles.tabBtn} ${
            activeTab === 'roles' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <Shield size={16} /> Phân Quyền & Vai Trò
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backups')}
          className={`${styles.tabBtn} ${
            activeTab === 'backups' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <Database size={16} /> Sao Lưu Dữ Liệu
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit-logs')}
          className={`${styles.tabBtn} ${
            activeTab === 'audit-logs' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <FileText size={16} /> Nhật Ký Hoạt Động
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'users' && <AdminUserTab onUsersChange={setUsers} />}
      {activeTab === 'roles' && <AdminRoleTab />}
      {activeTab === 'backups' && <AdminBackupTab />}
      {activeTab === 'audit-logs' && <AdminAuditTab />}
    </div>
  );
};

export default AdminDashboard;
