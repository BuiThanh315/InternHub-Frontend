import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Database, FileText, Server } from 'lucide-react';

import { Header } from '../../components/layout/Header';
import {
  AdminAnalyticsHub,
  AdminMetricsGrid,
  AdminUserTab,
  AdminRoleTab,
  AdminBackupTab,
  AdminAuditTab,
} from './components';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import styles from './AdminDashboard.module.css';

type SystemSubTab = 'health' | 'backups' | 'audit-logs';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [systemTab, setSystemTab] = useState<SystemSubTab>('health');
  const [users, setUsers] = useState<User[]>([]);

  // Tải danh sách người dùng cho Analytics Hub
  const loadUsers = useCallback(async () => {
    try {
      const res = await userService.getUsers({ page: 0, size: 100 });
      setUsers(res.items || res.content || []);
    } catch (err) {
      console.error('Không thể tải danh sách người dùng:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const isDashboardHome = location.pathname === '/admin' || location.pathname === '/admin/dashboard';
  const isUsersPage = location.pathname.includes('/users');
  const isRolesPage = location.pathname.includes('/roles');
  const isSystemPage = location.pathname.includes('/system');

  const getPageTitle = () => {
    if (isUsersPage) return 'Quản Lý Người Dùng & Tài Khoản';
    if (isRolesPage) return 'Phân Quyền & Vai Trò Hệ Thống';
    if (isSystemPage) return 'Giám Sát Hệ Thống & Sao Lưu';
    return 'Bảng Điều Khiển Quản Trị Hệ Thống';
  };

  const getPageSubtitle = () => {
    if (isUsersPage) return 'Quản trị hồ sơ, đổi vai trò, mở/khóa tài khoản và đặt lại mật khẩu người dùng';
    if (isRolesPage) return 'Ma trận phân quyền chi tiết 53 đặc quyền cho 4 vai trò Admin, HR, Mentor, Thực tập sinh';
    if (isSystemPage) return 'Giám sát cụm Microservices thời gian thực, sao lưu dữ liệu tự động và nhật ký kiểm toán';
    return 'Trung tâm phân tích cơ cấu tài khoản, theo dõi sự kiện kiểm toán và điều phối phân hệ doanh nghiệp';
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <Header
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
      />

      {/* 1. TRANG CHỦ ADMIN DASHBOARD: Hiển thị Analytics Hub chuyên nghiệp, xóa sạch cụm microservices to tướng */}
      {isDashboardHome && (
        <AdminAnalyticsHub users={users} onRefreshUsers={loadUsers} />
      )}

      {/* 2. TRANG QUẢN LÝ NGƯỜI DÙNG (/admin/users): Toàn màn hình bảng người dùng + actions */}
      {isUsersPage && (
        <AdminUserTab onUsersChange={setUsers} />
      )}

      {/* 3. TRANG PHÂN QUYỀN & VAI TRÒ (/admin/roles): Toàn màn hình ma trận 53 quyền */}
      {isRolesPage && (
        <AdminRoleTab />
      )}

      {/* 4. TRANG GIÁM SÁT HỆ THỐNG (/admin/system): Cụm Microservices, Sao Lưu MinIO S3 & Nhật Ký Kiểm Toán */}
      {isSystemPage && (
        <div>
          <div className={styles.systemSubTabNav}>
            <button
              type="button"
              onClick={() => setSystemTab('health')}
              className={`${styles.tabBtn} ${systemTab === 'health' ? styles.tabActive : styles.tabInactive}`}
            >
              <Server size={16} /> Cụm Microservices
            </button>
            <button
              type="button"
              onClick={() => setSystemTab('backups')}
              className={`${styles.tabBtn} ${systemTab === 'backups' ? styles.tabActive : styles.tabInactive}`}
            >
              <Database size={16} /> Sao Lưu & Snapshot MinIO
            </button>
            <button
              type="button"
              onClick={() => setSystemTab('audit-logs')}
              className={`${styles.tabBtn} ${systemTab === 'audit-logs' ? styles.tabActive : styles.tabInactive}`}
            >
              <FileText size={16} /> Nhật Ký Hoạt Động (Audit Logs)
            </button>
          </div>

          {systemTab === 'health' && <AdminMetricsGrid />}
          {systemTab === 'backups' && <AdminBackupTab />}
          {systemTab === 'audit-logs' && <AdminAuditTab />}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

