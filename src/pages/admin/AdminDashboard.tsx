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
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { userService } from '../../services/userService';
import type { User } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

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
      </div>
    </div>
  );
};
