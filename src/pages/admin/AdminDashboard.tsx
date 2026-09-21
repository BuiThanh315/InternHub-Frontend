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
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { userService } from '../../services/userService';
import { backupService } from '../../services/backupService';
import type { User, BackupHistoryItem } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Backup TM-8 states
  const [backups, setBackups] = useState<BackupHistoryItem[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [triggeringBackup, setTriggeringBackup] = useState(false);

  useEffect(() => {
    loadUsers();
    loadBackups();
  }, []);

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
    } catch (err) {
      alert('Không thể xóa bản sao lưu');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const updated = await userService.toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert('Không thể thay đổi trạng thái người dùng');
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

  return (
    <div className="animate-fade-in">
      <Header
        title="Quản Trị Hệ Thống (Admin Portal)"
        subtitle="Giám sát hệ sinh thái Microservices, quản lý tài khoản và phân quyền người dùng"
      />

      <div style={{ marginTop: '1.5rem' }}>
        {/* Metric KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {/* Total Accounts */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Tổng Người Dùng</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{users.length}</h3>
            </div>
          </div>

          {/* HR Role Count */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserCheck size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Nhân Sự (HR)</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{countByRole('HR')}</h3>
            </div>
          </div>

          {/* Mentor Count */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Người Hướng Dẫn</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{countByRole('MENTOR')}</h3>
            </div>
          </div>

          {/* Interns Count */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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

        {/* User Management Section */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Danh Sách Tài Khoản Người Dùng</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Quản lý trạng thái hoạt động và phân quyền trong hệ thống
              </p>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
                  placeholder="Tìm kiếm theo tên, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN</option>
                <option value="HR">HR</option>
                <option value="MENTOR">MENTOR</option>
                <option value="INTERN">INTERN</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Họ và Tên</th>
                  <th>Email & Liên Hệ</th>
                  <th>Phòng Ban & Vị Trí</th>
                  <th>Vai Trò (Role)</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy người dùng phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                      <td>
                        <div>{u.email}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'Chưa cập nhật'}</span>
                      </td>
                      <td>
                        <div>{u.department || 'Chưa gán phòng ban'}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.position || 'Nhân viên'}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          u.role === 'ADMIN' ? 'badge-danger' :
                          u.role === 'HR' ? 'badge-info' :
                          u.role === 'MENTOR' ? 'badge-success' : 'badge-primary'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.status === 'ACTIVE' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Hoạt động
                          </span>
                        ) : (
                          <span className="badge badge-neutral">
                            <XCircle size={12} /> Bị khóa
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-secondary' : 'btn-success'}`}
                        >
                          {u.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Data Backup Management (TM-8) */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  padding: '0.4rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                    Sao Lưu & Phục Hồi Dữ Liệu Hệ Thống (TM-8)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Lập lịch tự động hàng ngày (02:00 AM), nén GZIP, lưu trữ 30 ngày và hỗ trợ sao lưu thủ công tức thì
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={loadBackups}
                className="btn btn-secondary btn-sm"
                disabled={backupLoading}
                title="Làm mới danh sách"
              >
                <RefreshCw size={14} className={backupLoading ? 'animate-spin' : ''} /> Làm mới
              </button>

              <button
                onClick={handleTriggerBackup}
                className="btn btn-primary btn-sm"
                disabled={triggeringBackup}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600,
                }}
              >
                {triggeringBackup ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Đang sao lưu...
                  </>
                ) : (
                  <>
                    <Play size={14} /> Kích Hoạt Sao Lưu Ngay
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Backup Summary Pills */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.25rem',
            padding: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '8px',
            border: '1px solid var(--border-default)',
          }}>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Chu kỳ Cron:</span>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '2px 0 0 0' }}>0 0 2 * * ? (Hàng ngày 02:00 AM)</p>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Chính sách lưu trữ (Retention):</span>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '2px 0 0 0' }}>30 Ngày (Xóa tự động)</p>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Định dạng nén:</span>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '2px 0 0 0' }}>MySQL Dump (.sql.gz)</p>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Tổng bản sao lưu:</span>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', margin: '2px 0 0 0' }}>
                {backups.length} bản ghi
              </p>
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
                      Đang tải danh sách bản sao lưu...
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
                        <div style={{ fontSize: '0.825rem' }}>
                          {new Date(b.createdAt).toLocaleString('vi-VN')}
                        </div>
                        {b.durationMs && (
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            Thời gian chạy: {(b.durationMs / 1000).toFixed(2)}s
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {b.createdBy}
                      </td>
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
      </div>
    </div>
  );
};
