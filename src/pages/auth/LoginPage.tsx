import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, User as UserIcon, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const isExpired = searchParams.get('expired') === 'true';

  const handleRedirect = (role: string) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'HR':
        navigate('/hr/dashboard');
        break;
      case 'MENTOR':
        navigate('/mentor/dashboard');
        break;
      case 'INTERN':
      default:
        navigate('/intern/dashboard');
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

  const handleDemoLogin = (role: 'admin' | 'hr' | 'mentor' | 'intern') => {
    const authUser = demoLogin(role);
    handleRedirect(authUser.role);
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
              placeholder="admin, hr, mentor, intern..."
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

      {/* Demo Quick-Login section */}
      <div style={{
        marginTop: '2rem',
        padding: '1.25rem',
        borderRadius: '12px',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(51, 65, 85, 0.8)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.85rem',
          color: '#fbbf24',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          <Sparkles size={14} />
          <span>Trải Nghiệm Nhanh Theo Vai Trò (Demo)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            style={{
              padding: '0.55rem',
              borderRadius: '8px',
              border: '1px solid #ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            🛡️ Quyền Admin
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('hr')}
            style={{
              padding: '0.55rem',
              borderRadius: '8px',
              border: '1px solid #3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            👔 Quyền HR
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('mentor')}
            style={{
              padding: '0.55rem',
              borderRadius: '8px',
              border: '1px solid #10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#34d399',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            🧑‍🏫 Quyền Mentor
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('intern')}
            style={{
              padding: '0.55rem',
              borderRadius: '8px',
              border: '1px solid #8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#a78bfa',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            🎓 Quyền Thực Tập Sinh
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div style={{
        marginTop: '1.75rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#94a3b8',
      }}>
        <span>Bạn là sinh viên muốn ứng tuyển thực tập? </span>
        <Link
          to="/register"
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
