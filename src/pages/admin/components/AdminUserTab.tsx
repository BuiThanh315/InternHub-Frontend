import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import { Alert } from '../../../components/common/Alert/Alert';
import { userService } from '../../../services/userService';
import { formatDateTime } from '../../../utils/formatters';
import type { User } from '../../../types';
import styles from './AdminUserTab.module.css';

interface AdminUserTabProps {
  onUsersChange?: (users: User[]) => void;
}

export const AdminUserTab: React.FC<AdminUserTabProps> = ({ onUsersChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await userService.getAllUsers();
      setUsers(data);
      if (onUsersChange) {
        onUsersChange(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách tài khoản từ máy chủ.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [onUsersChange]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (id: number) => {
    try {
      setActionSuccess(null);
      setErrorMessage(null);
      const updated = await userService.toggleUserStatus(id);
      const updatedList = users.map((u) => (u.id === id ? updated : u));
      setUsers(updatedList);
      if (onUsersChange) {
        onUsersChange(updatedList);
      }
      setActionSuccess(
        `Đã ${updated.status === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản ${updated.fullName} thành công.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thay đổi trạng thái người dùng';
      setErrorMessage(msg);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchKw =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchKw && matchRole;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-primary';
      case 'HR':
        return 'badge-info';
      case 'MENTOR':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="card">
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.title}>Quản Lý Tài Khoản Người Dùng</h3>
          <p className={styles.subtitle}>
            Danh sách người dùng và phân quyền trong toàn bộ hệ thống
          </p>
        </div>

        {/* Filters */}
        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <Search size={16} color="var(--text-muted)" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm tên, email, phòng ban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={styles.select}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
            <option value="HR">Nhân sự (HR)</option>
            <option value="MENTOR">Người hướng dẫn</option>
            <option value="INTERN">Thực tập sinh</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            title="Tải lại danh sách"
          >
            <RefreshCw size={15} />
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert
          type="success"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* User Table */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Họ và Tên</th>
              <th>Email / Số Điện Thoại</th>
              <th>Phòng Ban / Vị Trí</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.tableMessage}>
                  Đang tải danh sách người dùng từ API Backend...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.tableMessage}>
                  Không tìm thấy người dùng nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userName}>{u.fullName}</div>
                  </td>
                  <td>
                    <div>{u.email}</div>
                    <span className={styles.subText}>
                      {u.phone || 'Chưa cập nhật'}
                    </span>
                  </td>
                  <td>
                    <div>{u.department || 'Chưa phân bổ'}</div>
                    <span className={styles.subText}>{u.position || '--'}</span>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(u.role || '')}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.status === 'ACTIVE' ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <XCircle size={12} /> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className={styles.dateText}>
                    {formatDateTime(u.createdAt)}
                  </td>
                  <td>
                    <Button
                      variant={u.status === 'ACTIVE' ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleStatus(u.id)}
                    >
                      {u.status === 'ACTIVE' ? 'Khóa TK' : 'Mở Khóa'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserTab;
