import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, User as UserIcon, AlertCircle, Sparkles, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { RoleType } from '../../types';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login, demoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const isExpired = searchParams.get('expired') === 'true';

  const handleRedirect = (role: RoleType | string) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'HR':
        navigate('/hr/dashboard', { replace: true });
        break;
      case 'MENTOR':
        navigate('/mentor/dashboard', { replace: true });
        break;
      case 'INTERN':
      default:
        navigate('/intern/dashboard', { replace: true });
        break;
    }
  };

  // Tự động chuyển hướng nếu người dùng đã đăng nhập từ trước
  useEffect(() => {
    if (isAuthenticated && user) {
      handleRedirect(user.role);
    }
  }, [isAuthenticated, user]);

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

  const handleDemoLogin = async (role: 'admin' | 'hr' | 'mentor' | 'intern') => {
    try {
      setError(null);
      setLoading(true);
      const authUser = await demoLogin(role);
      handleRedirect(authUser.role);
    } catch (err: any) {
      setError(err.message || 'Không thể đăng nhập tài khoản demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Đăng Nhập Hệ Thống
        </h2>
        <p className="text-sm text-slate-400">
          Nhập thông tin tài khoản để truy cập không gian làm việc của bạn.
        </p>
      </div>

      {/* Thông báo hết hạn phiên */}
      {isExpired && (
        <div className="flex items-center gap-3 p-3.5 mb-5 text-sm rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.</span>
        </div>
      )}

      {/* Thông báo lỗi */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 mb-5 text-sm rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Tên đăng nhập / Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserIcon size={18} />
            </span>
            <input
              type="text"
              required
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="admin, hr, mentor, intern..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              className="w-full pl-10 pr-11 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Đang xác thực...</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Đăng Nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Quick-Login section */}
      <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>Trải Nghiệm Nhanh Theo Vai Trò (Demo)</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('admin')}
            className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>🛡️ Quyền Admin</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('hr')}
            className="p-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>👔 Quyền HR</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('mentor')}
            className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>🧑‍🏫 Quyền Mentor</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('intern')}
            className="p-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>🎓 Quyền Thực Tập Sinh</span>
          </button>
        </div>
      </div>

      {/* Switch to Register or Public Apply */}
      <div className="mt-6 text-center text-xs sm:text-sm text-slate-400 space-y-2">
        <div>
          <span>Bạn là sinh viên muốn ứng tuyển thực tập? </span>
          <Link
            to="/apply"
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors"
          >
            Nộp CV & Hồ Sơ Online <ArrowRight size={14} />
          </Link>
        </div>
        <div>
          <Link
            to="/"
            className="text-slate-500 hover:text-slate-300 text-xs inline-flex items-center gap-1 transition-colors"
          >
            ← Quay lại Trang Chủ InternHub
          </Link>
        </div>
      </div>
    </div>
  );
};

