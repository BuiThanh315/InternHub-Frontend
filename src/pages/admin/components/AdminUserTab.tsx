import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, KeyRound, Shield, Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Alert, Skeleton, Pagination, ConfirmModal, Modal } from '../../../components/common';
import { userService } from '../../../services/userService';
import { formatDateTime, formatPhoneNumber, getUserRoleLabel } from '../../../utils/formatters';
import type { User } from '../../../types';
import styles from './AdminUserTab.module.css';

interface AdminUserTabProps {
  onUsersChange?: (users: User[]) => void;
}

export const AdminUserTab: React.FC<AdminUserTabProps> = ({ onUsersChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Confirm lock modal state
  const [userToLock, setUserToLock] = useState<User | null>(null);
  const [lockingUser, setLockingUser] = useState(false);

  // Reset password modal state
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Update role modal state
  const [userToUpdateRole, setUserToUpdateRole] = useState<User | null>(null);
  const [newRoleSelection, setNewRoleSelection] = useState<string>('INTERN');
  const [updatingRole, setUpdatingRole] = useState(false);

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

  const executeResetPassword = async () => {
    if (!userToResetPassword) return;
    try {
      setResettingPassword(true);
      await userService.resetPassword(userToResetPassword.id, '123456');
      toast.success(`Đã đặt lại mật khẩu cho ${userToResetPassword.fullName} thành "123456" thành công.`);
      setUserToResetPassword(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu người dùng';
      toast.error(msg);
    } finally {
      setResettingPassword(false);
    }
  };

  const executeUpdateRole = async () => {
    if (!userToUpdateRole) return;
    try {
      setUpdatingRole(true);
      const updated = await userService.updateUserRole(userToUpdateRole.id, newRoleSelection);
      const updatedList = users.map((u) => (u.id === userToUpdateRole.id ? updated : u));
      setUsers(updatedList);
      if (onUsersChange) {
        onUsersChange(updatedList);
      }
      toast.success(`Đã đổi vai trò của ${updated.fullName} thành ${getUserRoleLabel(updated.role)} thành công.`);
      setUserToUpdateRole(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thay đổi vai trò người dùng';
      toast.error(msg);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleExportUsersExcel = () => {
    try {
      const headers = ['ID', 'Họ và Tên', 'Email', 'Số Điện Thoại', 'Phòng Ban', 'Vai Trò', 'Trạng Thái', 'Ngày Tạo'];
      const rows = filteredUsers.map((u) => [
        u.id,
        `"${u.fullName.replace(/"/g, '""')}"`,
        u.email,
        u.phone || '',
        `"${(u.department || 'Chưa phân bổ').replace(/"/g, '""')}"`,
        u.role || '',
        u.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa',
        formatDateTime(u.createdAt),
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_nguoi_dung_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Đã xuất ${filteredUsers.length} tài khoản ra file CSV/Excel thành công.`);
    } catch (e) {
      toast.error('Lỗi khi xuất danh sách người dùng');
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
    const matchStatus = selectedStatus === 'ALL' || u.status === selectedStatus;
    return matchKw && matchRole && matchStatus;
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
            Toàn bộ {users.length} tài khoản trong hệ thống ({users.filter((u) => u.status === 'ACTIVE').length} đang hoạt động, {users.filter((u) => u.status !== 'ACTIVE').length} đã khóa)
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

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className={styles.roleSelect}
          >
            <option value="ALL">Tất Cả Trạng Thái</option>
            <option value="ACTIVE">Đang Hoạt Động</option>
            <option value="INACTIVE">Đã Khóa</option>
          </select>

          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportUsersExcel}
            title="Xuất danh sách người dùng lọc ra file Excel/CSV"
          >
            <Download size={14} /> Xuất Excel
          </button>

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
              <th>Họ và tên</th>
              <th>Email / Số điện thoại</th>
              <th>Phòng ban / Vị trí</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
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
                    <span className={`${styles.subText} font-tabular`}>
                      {u.phone ? formatPhoneNumber(u.phone) : 'Chưa cập nhật'}
                    </span>
                  </td>
                  <td>
                    <div>{u.department || 'Chưa phân bổ'}</div>
                    <span className={styles.subText}>{u.position || '--'}</span>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(u.role || '')}`}>
                      {getUserRoleLabel(u.role)}
                    </span>
                  </td>
                  <td>
                    {u.status === 'ACTIVE' ? (
                      <span className="badge badge-success">
                        <span className="status-dot status-dot-success mr-1" /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <span className="status-dot status-dot-danger mr-1" /> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className={`${styles.dateText} font-tabular`}>
                    {formatDateTime(u.createdAt)}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button
                        variant={u.status === 'ACTIVE' ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleStatusButtonClick(u)}
                      >
                        {u.status === 'ACTIVE' ? 'Khóa TK' : 'Mở Khóa'}
                      </Button>

                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="Đặt lại mật khẩu về mặc định (123456)"
                        onClick={() => setUserToResetPassword(u)}
                      >
                        <KeyRound size={15} />
                      </button>

                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="Thay đổi vai trò (Role)"
                        onClick={() => {
                          setUserToUpdateRole(u);
                          setNewRoleSelection(u.role || 'INTERN');
                        }}
                      >
                        <Shield size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && filteredUsers.length > pageSize && (
        <div style={{ marginTop: '1rem' }}>
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}

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

      {/* Confirm Reset Password Modal */}
      {userToResetPassword && (
        <ConfirmModal
          isOpen={!!userToResetPassword}
          title="Đặt lại mật khẩu người dùng"
          message={`Bạn có chắc chắn muốn đặt lại mật khẩu cho ${userToResetPassword.fullName} (${userToResetPassword.email}) về mặc định "123456"?`}
          confirmText="Đặt Lại Mật Khẩu"
          cancelText="Hủy Bỏ"
          variant="primary"
          isLoading={resettingPassword}
          onConfirm={executeResetPassword}
          onClose={() => setUserToResetPassword(null)}
        />
      )}

      {/* Update Role Modal */}
      {userToUpdateRole && (
        <Modal
          isOpen={!!userToUpdateRole}
          title="Phân Bổ & Thay Đổi Vai Trò"
          onClose={() => setUserToUpdateRole(null)}
          size="sm"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Chọn vai trò mới cho người dùng <strong>{userToUpdateRole.fullName}</strong> ({userToUpdateRole.email}):
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Vai Trò Hệ Thống:
              </label>
              <select
                value={newRoleSelection}
                onChange={(e) => setNewRoleSelection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem',
                }}
              >
                <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                <option value="HR">Nhân Sự (HR)</option>
                <option value="MENTOR">Người Hướng Dẫn (MENTOR)</option>
                <option value="INTERN">Thực Tập Sinh (INTERN)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button variant="secondary" size="md" onClick={() => setUserToUpdateRole(null)} disabled={updatingRole}>
                Hủy Bỏ
              </Button>
              <Button variant="primary" size="md" onClick={executeUpdateRole} isLoading={updatingRole}>
                Lưu Thay Đổi
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUserTab;
