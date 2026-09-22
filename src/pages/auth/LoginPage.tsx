import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const navigate = useNavigate();

  const isExpired = searchParams.get('expired') === 'true';

  const handleRedirect = (role: string) => {
    switch (role) {
      case 'ADMIN':
        navigate(ROUTES.ADMIN.DASHBOARD);
        break;
      case 'HR':
        navigate(ROUTES.HR.DASHBOARD);
        break;
      case 'MENTOR':
        navigate(ROUTES.MENTOR.DASHBOARD);
        break;
      case 'INTERN':
      default:
        navigate(ROUTES.INTERN.DASHBOARD);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const authUser = await login(username, password);
      handleRedirect(authUser.role);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          Đăng Nhập Hệ Thống
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Nhập thông tin tài khoản để truy cập không gian làm việc của bạn.
        </p>
      </div>

      {isExpired && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: '#fca5a5',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
        }}>
          <AlertCircle size={18} />
          <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: '#fca5a5',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ color: '#cbd5e1' }}>Tên đăng nhập / Email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}>
              <UserIcon size={18} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                color: '#fff',
              }}
              placeholder="Tên đăng nhập hoặc email..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ color: '#cbd5e1' }}>Mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}>
              <Lock size={18} />
            </span>
            <input
              type="password"
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                color: '#fff',
              }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
        >
          {loading ? (
            'Đang xác thực...'
          ) : (
            <>
              <LogIn size={18} />
              <span>Đăng Nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#94a3b8',
      }}>
        <span>Bạn là sinh viên muốn ứng tuyển thực tập? </span>
        <Link
          to={ROUTES.AUTH.REGISTER}
          style={{
            color: '#818cf8',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          Nộp hồ sơ ngay <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
export default LoginPage;
