import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Server,
  Activity,
  UserCheck,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Database,
  Download,
  Trash2,
  Play,
  RefreshCw,
  FileArchive,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { userService } from '../../services/userService';
import { backupService } from '../../services/backupService';
import { auditLogService } from '../../services/auditLogService';
import type {
  User,
  BackupHistoryItem,
  AuditLogItem,
  AuditLogDetail,
  AuditLogStats,
  AuditLogFilterParams,
} from '../../types';

export const AdminDashboard: React.FC = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'users' | 'backups' | 'audit-logs'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Backup TM-8 states
  const [backups, setBackups] = useState<BackupHistoryItem[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [triggeringBackup, setTriggeringBackup] = useState(false);

  // Audit Logs TM-9 states (100% Real API)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditStats, setAuditStats] = useState<AuditLogStats | null>(null);

  // Audit Filters & Pagination
  const [auditKeyword, setAuditKeyword] = useState('');
  const [auditModule, setAuditModule] = useState('ALL');
  const [auditStatus, setAuditStatus] = useState('ALL');
  const [auditFromDate, setAuditFromDate] = useState('');
  const [auditToDate, setAuditToDate] = useState('');
  const [auditPage, setAuditPage] = useState(0);
  const [auditSize, setAuditSize] = useState(15);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalItems, setAuditTotalItems] = useState(0);

  // Audit detail modal
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogDetail | null>(null);
  const [exportingCsv, setExportingCsv] = useState(false);

  useEffect(() => {
    loadUsers();
    loadBackups();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit-logs') {
      loadAuditLogs();
      loadAuditStats();
    }
  }, [activeTab, auditPage, auditSize, auditModule, auditStatus]);

  // Debounced search for audit logs
  useEffect(() => {
    if (activeTab !== 'audit-logs') return;
    const timer = setTimeout(() => {
      setAuditPage(0);
      loadAuditLogs();
    }, 400);
    return () => clearTimeout(timer);
  }, [auditKeyword, auditFromDate, auditToDate]);

  // Load audit logs via Real Backend API
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      setAuditError(null);

      const params: AuditLogFilterParams = {
        page: auditPage,
        size: auditSize,
        keyword: auditKeyword.trim() || undefined,
        module: auditModule !== 'ALL' ? auditModule : undefined,
        status: auditStatus !== 'ALL' ? auditStatus : undefined,
        fromDate: auditFromDate || undefined,
        toDate: auditToDate || undefined,
      };

      const res = await auditLogService.getAuditLogs(params);
      const items = res.items || res.content || [];
      setAuditLogs(items);
      setAuditTotalPages(res.totalPages || 1);
      setAuditTotalItems(res.totalItems ?? res.totalElements ?? items.length);
    } catch (err: any) {
      console.error('Lỗi khi tải nhật ký hoạt động từ backend:', err);
      setAuditError(err.message || 'Không thể kết nối đến máy chủ để lấy nhật ký hoạt động.');
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      const stats = await auditLogService.getAuditStatistics();
      setAuditStats(stats);
    } catch (err) {
      console.warn('Lỗi tải thống kê nhật ký:', err);
    }
  };

  const handleOpenLogDetail = async (id: number) => {
    try {
      const detail = await auditLogService.getAuditLogById(id);
      setSelectedLogDetail(detail);
    } catch (err: any) {
      alert(err.message || 'Không thể lấy chi tiết nhật ký này');
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const params: AuditLogFilterParams = {
        keyword: auditKeyword.trim() || undefined,
        module: auditModule !== 'ALL' ? auditModule : undefined,
        status: auditStatus !== 'ALL' ? auditStatus : undefined,
        fromDate: auditFromDate || undefined,
        toDate: auditToDate || undefined,
      };
      await auditLogService.exportAuditLogsCsv(params);
    } catch (err: any) {
      alert('Lỗi xuất tệp CSV: ' + (err.message || 'Không thể tải tệp'));
    } finally {
      setExportingCsv(false);
    }
  };

  const loadBackups = async () => {
    try {
      setBackupLoading(true);
      const res = await backupService.getBackups();
      setBackups(res.content || []);
    } catch (err) {
      console.error('Lỗi tải lịch sử sao lưu:', err);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleTriggerBackup = async () => {
    if (!window.confirm('Bạn có chắc muốn kích hoạt sao lưu cơ sở dữ liệu ngay bây giờ?')) {
      return;
    }
    try {
      setTriggeringBackup(true);
      const newBackup = await backupService.triggerManualBackup();
      alert(`Khởi tạo sao lưu thành công: ${newBackup.fileName}`);
      await loadBackups();
      if (activeTab === 'audit-logs') {
        loadAuditLogs();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kích hoạt sao lưu');
    } finally {
      setTriggeringBackup(false);
    }
  };

  const handleDownloadBackup = async (b: BackupHistoryItem) => {
    try {
      await backupService.downloadBackup(b.id, b.fileName);
    } catch (err) {
      alert('Không thể tải tệp sao lưu');
    }
  };

  const handleDeleteBackup = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản sao lưu này không?')) {
      return;
    }
    try {
      await backupService.deleteBackup(id);
      setBackups((prev) => prev.filter((b) => b.id !== id));
      if (activeTab === 'audit-logs') {
        loadAuditLogs();
      }
    } catch (err) {
      alert('Không thể xóa bản sao lưu');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUserError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Lỗi tải danh sách người dùng:', err);
      setUserError('Không thể tải danh sách tài khoản từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const updated = await userService.toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      // Nếu đang ở tab audit log hoặc muốn refresh
      if (activeTab === 'audit-logs') {
        loadAuditLogs();
      }
    } catch (err: any) {
      alert(err.message || 'Không thể thay đổi trạng thái người dùng');
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

  const countByRole = (roleName: string) => users.filter((u) => u.role === roleName).length;

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return '--';
    try {
      return new Date(isoStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const getModuleBadgeClass = (module: string) => {
    switch (module) {
      case 'AUTH':
        return 'badge-warning';
      case 'INTERN':
        return 'badge-primary';
      case 'DOCUMENT':
        return 'badge-info';
      case 'SYSTEM':
        return 'badge-danger';
      case 'USER':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Quản Trị Hệ Thống (Admin Portal)"
        subtitle="Giám sát hệ sinh thái Microservices, quản lý tài khoản và theo dõi nhật ký kiểm toán thời gian thực"
      />

      <div style={{ marginTop: '1.5rem' }}>
        {/* Metric KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Total Accounts */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Tổng Người Dùng</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{users.length}</h3>
            </div>
          </div>

          {/* HR Role Count */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Nhân Sự (HR)</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{countByRole('HR')}</h3>
            </div>
          </div>

          {/* Mentor Count */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Người Hướng Dẫn</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{countByRole('MENTOR')}</h3>
            </div>
          </div>

          {/* Interns Count */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Thực Tập Sinh</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{countByRole('INTERN')}</h3>
            </div>
          </div>
        </div>

        {/* Microservices Status Bar */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Server size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Trạng Thái Cụm Microservices</h4>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              { name: 'API Gateway', port: '8080', status: 'Hoạt động tốt' },
              { name: 'Discovery Server (Eureka)', port: '8761', status: 'Sẵn sàng' },
              { name: 'Config Server', port: '8888', status: 'Đã nạp kho cấu hình' },
              { name: 'Employee Service', port: '8081', status: 'Đang kết nối DB' },
            ].map((svc) => (
              <div
                key={svc.name}
                style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{svc.name}</p>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Cổng: {svc.port}</span>
                </div>
                <span className="badge badge-success">
                  <Activity size={12} /> {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            borderBottom: '2px solid var(--border-default)',
            paddingBottom: '0.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} /> Tài Khoản & Phân Quyền
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`btn ${activeTab === 'backups' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Database size={16} /> Sao Lưu Dữ Liệu (TM-8)
          </button>
          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`btn ${activeTab === 'audit-logs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} /> Nhật Ký Hoạt Động (TM-9)
          </button>
        </div>

        {/* TAB 1: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Quản Lý Tài Khoản Người Dùng
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Danh sách người dùng và phân quyền trong toàn bộ hệ thống
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Tìm tên, email, phòng ban..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: '0.5rem 1rem 0.5rem 2.25rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '0.85rem',
                      width: '240px',
                    }}
                  />
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                  <option value="HR">Nhân sự (HR)</option>
                  <option value="MENTOR">Người hướng dẫn</option>
                  <option value="INTERN">Thực tập sinh</option>
                </select>

                <button
                  onClick={loadUsers}
                  className="btn btn-secondary"
                  title="Tải lại danh sách"
                  style={{ padding: '0.5rem 0.75rem' }}
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {userError && (
              <div
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{userError}</span>
                <button onClick={loadUsers} className="btn btn-sm btn-secondary">
                  Thử lại
                </button>
              </div>
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                        Đang tải danh sách người dùng từ API Backend...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Không tìm thấy người dùng nào phù hợp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                        </td>
                        <td>
                          <div>{u.email}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {u.phone || 'Chưa cập nhật'}
                          </span>
                        </td>
                        <td>
                          <div>{u.department || 'Chưa phân bổ'}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {u.position || '--'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              u.role === 'ADMIN'
                                ? 'badge-primary'
                                : u.role === 'HR'
                                ? 'badge-info'
                                : u.role === 'MENTOR'
                                ? 'badge-success'
                                : 'badge-secondary'
                            }`}
                          >
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
                        <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {formatDateTime(u.createdAt)}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            {u.status === 'ACTIVE' ? 'Khóa TK' : 'Mở Khóa'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DATABASE BACKUPS (TM-8) */}
        {activeTab === 'backups' && (
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={20} color="var(--primary)" />
                  Sao Lưu Dữ Liệu Hệ Thống Định Kỳ (TM-8)
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Snapshot toàn bộ cơ sở dữ liệu MySQL, nén định dạng .sql.gz và tự động xoay vòng 30 ngày
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={loadBackups}
                  disabled={backupLoading}
                  className="btn btn-secondary"
                  title="Tải lại danh sách sao lưu"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={15} className={backupLoading ? 'animate-spin' : ''} />
                  Làm mới
                </button>

                <button
                  onClick={handleTriggerBackup}
                  disabled={triggeringBackup}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Play size={16} />
                  {triggeringBackup ? 'Đang sao lưu...' : 'Sao Lưu Ngay'}
                </button>
              </div>
            </div>

            {/* Backup Table */}
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Tên Tệp Sao Lưu</th>
                    <th>Dung Lượng</th>
                    <th>Loại</th>
                    <th>Trạng Thái</th>
                    <th>Thời Gian Thực Hiện</th>
                    <th>Người Khởi Tạo</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {backupLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                        Đang tải danh sách bản sao lưu từ API Backend...
                      </td>
                    </tr>
                  ) : backups.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Chưa có bản sao lưu nào trong hệ thống
                      </td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileArchive size={16} color="var(--primary)" />
                            <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.825rem' }}>
                              {b.fileName}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, fontSize: '0.825rem' }}>
                          {b.formattedSize || `${(b.fileSize / (1024 * 1024)).toFixed(2)} MB`}
                        </td>
                        <td>
                          <span className={`badge ${b.backupType === 'AUTOMATIC' ? 'badge-info' : 'badge-primary'}`}>
                            {b.backupType === 'AUTOMATIC' ? 'Tự Động' : 'Thủ Công'}
                          </span>
                        </td>
                        <td>
                          {b.status === 'SUCCESS' && (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Thành Công
                            </span>
                          )}
                          {b.status === 'IN_PROGRESS' && (
                            <span className="badge badge-warning">
                              <RefreshCw size={12} className="animate-spin" /> Đang Chạy
                            </span>
                          )}
                          {b.status === 'FAILED' && (
                            <span className="badge badge-danger">
                              <AlertCircle size={12} /> Thất Bại
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.825rem' }}>{formatDateTime(b.createdAt)}</div>
                          {b.durationMs && (
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              Thời gian chạy: {(b.durationMs / 1000).toFixed(2)}s
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{b.createdBy}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleDownloadBackup(b)}
                              disabled={b.status !== 'SUCCESS'}
                              className="btn btn-sm btn-secondary"
                              title="Tải tệp .sql.gz"
                              style={{ padding: '0.35rem 0.6rem' }}
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBackup(b.id)}
                              className="btn btn-sm"
                              style={{
                                padding: '0.35rem 0.6rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: 'none',
                              }}
                              title="Xóa bản sao lưu"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOGS (TM-9 - 100% REAL BACKEND API) */}
        {activeTab === 'audit-logs' && (
          <div>
            {/* Audit KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sự Kiện Hôm Nay</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--primary)' }}>
                  {auditStats ? auditStats.totalToday : '--'}
                </h3>
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thành Công (Tỷ Lệ)</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 0 0', color: '#10b981' }}>
                  {auditStats ? `${auditStats.totalSuccess} (${auditStats.successRate}%)` : '--'}
                </h3>
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thất Bại / Lỗi</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 0 0', color: '#ef4444' }}>
                  {auditStats ? auditStats.totalFailed : '--'}
                </h3>
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phân Hệ Hoạt Động</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '4px 0 0 0' }}>
                  INTERN, AUTH, SYSTEM, DOC
                </p>
              </div>
            </div>

            {/* Main Audit Log Card */}
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} color="var(--primary)" />
                    Nhật Ký Hoạt Động Hệ Thống (Audit Logs - TM-9)
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Ghi vết tự động toàn bộ thao tác người dùng và hệ thống theo thời gian thực (Real-time DB)
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={loadAuditLogs}
                    disabled={auditLoading}
                    className="btn btn-secondary"
                    title="Tải lại dữ liệu"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RefreshCw size={15} className={auditLoading ? 'animate-spin' : ''} />
                    Làm mới
                  </button>

                  <button
                    onClick={handleExportCsv}
                    disabled={exportingCsv || auditLogs.length === 0}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FileSpreadsheet size={16} />
                    {exportingCsv ? 'Đang xuất CSV...' : 'Xuất CSV'}
                  </button>
                </div>
              </div>

              {/* Advanced Filter Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Keyword Search */}
                <div style={{ position: 'relative' }}>
                  <Search
                    size={15}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Tìm username, mô tả, URL..."
                    value={auditKeyword}
                    onChange={(e) => setAuditKeyword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.825rem',
                    }}
                  />
                </div>

                {/* Module Select */}
                <div>
                  <select
                    value={auditModule}
                    onChange={(e) => {
                      setAuditModule(e.target.value);
                      setAuditPage(0);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value="ALL">Tất cả Phân hệ</option>
                    <option value="AUTH">AUTH (Xác thực)</option>
                    <option value="INTERN">INTERN (Thực tập sinh)</option>
                    <option value="DOCUMENT">DOCUMENT (Tài liệu/CV)</option>
                    <option value="SYSTEM">SYSTEM (Hệ thống & Backup)</option>
                    <option value="USER">USER (Người dùng)</option>
                  </select>
                </div>

                {/* Status Select */}
                <div>
                  <select
                    value={auditStatus}
                    onChange={(e) => {
                      setAuditStatus(e.target.value);
                      setAuditPage(0);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value="ALL">Tất cả Trạng thái</option>
                    <option value="SUCCESS">SUCCESS (Thành công)</option>
                    <option value="FAILED">FAILED (Thất bại)</option>
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <input
                    type="date"
                    value={auditFromDate}
                    onChange={(e) => {
                      setAuditFromDate(e.target.value);
                      setAuditPage(0);
                    }}
                    title="Từ ngày"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.825rem',
                    }}
                  />
                </div>

                {/* To Date */}
                <div>
                  <input
                    type="date"
                    value={auditToDate}
                    onChange={(e) => {
                      setAuditToDate(e.target.value);
                      setAuditPage(0);
                    }}
                    title="Đến ngày"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.825rem',
                    }}
                  />
                </div>
              </div>

              {/* Error Notice */}
              {auditError && (
                <div
                  style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} />
                    <span>{auditError}</span>
                  </div>
                  <button onClick={loadAuditLogs} className="btn btn-sm btn-secondary">
                    Thử lại
                  </button>
                </div>
              )}

              {/* Audit Logs Data Table */}
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Thời Gian</th>
                      <th>Người Thực Hiện</th>
                      <th>Phân Hệ</th>
                      <th>Hành Động</th>
                      <th>Mô Tả Chi Tiết</th>
                      <th>IP Máy Trạm</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLoading ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>
                          <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                            Đang tải dữ liệu nhật ký hoạt động từ Backend...
                          </p>
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc hiện tại
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                            {formatDateTime(log.createdAt)}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{log.username}</div>
                            {log.userRole && (
                              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                ({log.userRole})
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${getModuleBadgeClass(log.module)}`}>
                              {log.module}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.825rem', maxWidth: '280px' }}>
                            <div
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={log.description}
                            >
                              {log.description}
                            </div>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {log.httpMethod} {log.endpoint}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.825rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {log.clientIp || '127.0.0.1'}
                          </td>
                          <td>
                            {log.status === 'SUCCESS' ? (
                              <span className="badge badge-success">
                                <CheckCircle2 size={12} /> Thành Công
                              </span>
                            ) : (
                              <span className="badge badge-danger">
                                <AlertCircle size={12} /> Thất Bại
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleOpenLogDetail(log.id)}
                              className="btn btn-sm btn-secondary"
                              title="Xem chi tiết sự kiện"
                              style={{ padding: '0.35rem 0.6rem' }}
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-side Pagination Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-default)',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Hiển thị {auditLogs.length} / tổng số <strong>{auditTotalItems}</strong> bản ghi (Trang{' '}
                  {auditPage + 1}/{auditTotalPages})
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <select
                    value={auditSize}
                    onChange={(e) => {
                      setAuditSize(Number(e.target.value));
                      setAuditPage(0);
                    }}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value={10}>10 dòng/trang</option>
                    <option value={15}>15 dòng/trang</option>
                    <option value={20}>20 dòng/trang</option>
                    <option value={50}>50 dòng/trang</option>
                  </select>

                  <button
                    onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
                    disabled={auditPage === 0 || auditLoading}
                    className="btn btn-sm btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <ChevronLeft size={14} /> Trước
                  </button>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {auditPage + 1}
                  </span>

                  <button
                    onClick={() => setAuditPage((p) => Math.min(auditTotalPages - 1, p + 1))}
                    disabled={auditPage >= auditTotalPages - 1 || auditLoading}
                    className="btn btn-sm btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    Tiếp <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AUDIT LOG DETAIL MODAL */}
      {selectedLogDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-default)',
                paddingBottom: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Chi Tiết Nhật Ký Hoạt Động #{selectedLogDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Thời gian thực hiện:</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>
                  {formatDateTime(selectedLogDetail.createdAt)}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Người thực hiện:</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>
                  {selectedLogDetail.username} ({selectedLogDetail.userRole || 'UNKNOWN'})
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phân hệ & Hành động:</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>
                  [{selectedLogDetail.module}] {selectedLogDetail.action}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span>
                <p style={{ margin: '2px 0 0 0' }}>
                  {selectedLogDetail.status === 'SUCCESS' ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Thành Công
                    </span>
                  ) : (
                    <span className="badge badge-danger">
                      <AlertCircle size={12} /> Thất Bại
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Endpoint & Phương thức:</span>
                <p style={{ fontFamily: 'monospace', fontWeight: 600, margin: '2px 0 0 0' }}>
                  {selectedLogDetail.httpMethod} {selectedLogDetail.endpoint}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Địa chỉ IP máy trạm:</span>
                <p style={{ fontFamily: 'monospace', margin: '2px 0 0 0' }}>
                  {selectedLogDetail.clientIp || '127.0.0.1'}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Thời gian xử lý:</span>
                <p style={{ margin: '2px 0 0 0' }}>
                  {selectedLogDetail.executionTimeMs ?? 0} ms
                </p>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mô tả hành vi:</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: '4px 0 0 0' }}>
                {selectedLogDetail.description}
              </p>
            </div>

            {/* User Agent */}
            {selectedLogDetail.userAgent && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thiết bị / Trình duyệt:</span>
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    backgroundColor: 'var(--bg-surface)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    margin: '4px 0 0 0',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedLogDetail.userAgent}
                </p>
              </div>
            )}

            {/* Error Message if failed */}
            {selectedLogDetail.errorMessage && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>Chi tiết lỗi:</span>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    margin: '4px 0 0 0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedLogDetail.errorMessage}
                </pre>
              </div>
            )}

            {/* Request Payload */}
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dữ liệu yêu cầu (Request Payload - Đã che mật khẩu):
              </span>
              <pre
                style={{
                  fontSize: '0.775rem',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  margin: '4px 0 0 0',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-default)',
                }}
              >
                {selectedLogDetail.requestPayload
                  ? (() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLogDetail.requestPayload), null, 2);
                      } catch {
                        return selectedLogDetail.requestPayload;
                      }
                    })()
                  : 'Không có dữ liệu payload cho yêu cầu này.'}
              </pre>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedLogDetail(null)} className="btn btn-secondary">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
