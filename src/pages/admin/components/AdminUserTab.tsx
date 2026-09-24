import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Alert, Skeleton, Pagination, ConfirmModal } from '../../../components/common';
import { userService } from '../../../services/userService';
import { formatDateTime, formatPhoneNumber } from '../../../utils/formatters';
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

  // Pagination state
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Confirm lock modal state
  const [userToLock, setUserToLock] = useState<User | null>(null);
  const [lockingUser, setLockingUser] = useState(false);

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

  const executeToggleStatus = async (user: User) => {
    try {
      setLockingUser(true);
      const updated = await userService.toggleUserStatus(user.id);
      const updatedList = users.map((u) => (u.id === user.id ? updated : u));
      setUsers(updatedList);
      if (onUsersChange) {
        onUsersChange(updatedList);
      }
      toast.success(
        `Đã ${updated.status === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản ${updated.fullName} thành công.`
      );
      setUserToLock(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thay đổi trạng thái người dùng';
      toast.error(msg);
    } finally {
      setLockingUser(false);
    }
  };

  const handleStatusButtonClick = (user: User) => {
    if (user.status === 'ACTIVE') {
      setUserToLock(user);
    } else {
      executeToggleStatus(user);
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

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

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
              placeholder="Tìm theo tên, email, phòng ban..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(0);
            }}
            className={styles.roleSelect}
          >
            <option value="ALL">Tất Cả Vai Trò</option>
            <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
            <option value="HR">Nhân Sự (HR)</option>
            <option value="MENTOR">Người Hướng Dẫn (MENTOR)</option>
            <option value="INTERN">Thực Tập Sinh (INTERN)</option>
          </select>

          <Button variant="secondary" size="sm" onClick={loadUsers} isLoading={loading}>
            <RefreshCw size={14} /> Tải Lại
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          className="mb-4"
        />
      )}

      {/* Users Table */}
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
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td><Skeleton width="130px" height="18px" /></td>
                  <td>
                    <Skeleton width="150px" height="18px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="100px" height="14px" />
                  </td>
                  <td>
                    <Skeleton width="110px" height="18px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="80px" height="14px" />
                  </td>
                  <td><Skeleton width="70px" height="24px" style={{ borderRadius: '12px' }} /></td>
                  <td><Skeleton width="90px" height="24px" style={{ borderRadius: '12px' }} /></td>
                  <td><Skeleton width="120px" height="18px" /></td>
                  <td><Skeleton width="80px" height="30px" /></td>
                </tr>
              ))
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.tableMessage}>
                  Không tìm thấy người dùng nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userName}>{u.fullName}</div>
                  </td>
                  <td>
                    <div>{u.email}</div>
                    <span className={styles.subText}>
                      {u.phone ? formatPhoneNumber(u.phone) : 'Chưa cập nhật'}
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
                      onClick={() => handleStatusButtonClick(u)}
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

      <div style={{ marginTop: '1rem' }}>
        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p - 1)}
        />
      </div>

      {/* Confirm Lock Modal */}
      {userToLock && (
        <ConfirmModal
          isOpen={!!userToLock}
          title="Xác nhận khóa tài khoản"
          message={`Bạn có chắc chắn muốn khóa tài khoản của ${userToLock.fullName} (${userToLock.email})? Người dùng này sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.`}
          confirmText="Khóa Tài Khoản"
          cancelText="Hủy Bỏ"
          variant="danger"
          isLoading={lockingUser}
          onConfirm={() => executeToggleStatus(userToLock)}
          onClose={() => setUserToLock(null)}
        />
      )}
    </div>
  );
};

export default AdminUserTab;
