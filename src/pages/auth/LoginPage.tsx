import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button, Alert } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import type { RoleType } from '../../types';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const isExpired = searchParams.get('expired') === 'true';

  const handleRedirect = React.useCallback(
    (role: RoleType | string) => {
      switch (role) {
        case 'ADMIN':
          navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
          break;
        case 'HR':
          navigate(ROUTES.HR.DASHBOARD, { replace: true });
          break;
        case 'MENTOR':
          navigate(ROUTES.MENTOR.DASHBOARD, { replace: true });
          break;
        case 'INTERN':
        default:
          navigate(ROUTES.INTERN.DASHBOARD, { replace: true });
          break;
      }
    },
    [navigate]
  );

  // Tự động chuyển hướng nếu người dùng đã có phiên đăng nhập từ trước
  useEffect(() => {
    if (isAuthenticated && user) {
      handleRedirect(user.role);
    }
  }, [isAuthenticated, user, handleRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const authUser = await login(username.trim(), password);
      handleRedirect(authUser.role);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Đăng Nhập Hệ Thống</h2>
        <p className={styles.subtitle}>
          Nhập thông tin tài khoản để truy cập không gian làm việc của bạn.
        </p>
      </div>

      {/* Thông báo phiên làm việc hết hạn */}
      {isExpired && (
        <Alert
          type="warning"
          message="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục làm việc."
          className="mb-4"
        />
      )}

      {/* Thông báo lỗi */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Form Đăng Nhập Chuẩn Xác Thực Backend Spring Security */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Tên đăng nhập / Email</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <UserIcon size={18} />
            </span>
            <input
              type="text"
              required
              disabled={loading}
              className={styles.input}
              placeholder="Tên đăng nhập hoặc email..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Mật khẩu</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePasswordBtn}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.submitBtn}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
          </Button>
        </div>
      </form>

      {/* Điều hướng đến Đăng ký hoặc Trang chủ */}
      <div className={styles.footer}>
        <div>
          <span>Bạn là sinh viên muốn ứng tuyển thực tập? </span>
          <Link to={ROUTES.AUTH.REGISTER} className={styles.registerLink}>
            Nộp hồ sơ ngay <ArrowRight size={14} />
          </Link>
        </div>
        <div>
          <Link to={ROUTES.ROOT} className={styles.backHomeLink}>
            ← Quay lại Trang Chủ InternHub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
