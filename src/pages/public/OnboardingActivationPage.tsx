import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../services/api';

export const OnboardingActivationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [candidateInfo, setCandidateInfo] = useState<{ email?: string; fullName?: string; role?: string } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Re-send activation states (Moved to top to adhere to React Rules of Hooks)
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIsValid(false);
      setErrorMessage('Không tìm thấy mã xác thực kích hoạt trong liên kết.');
      return;
    }

    // Safe Links Scanner chỉ ghé qua GET này -> An toàn 100%, không hủy token!
    const verifyToken = async () => {
      try {
        const res = await apiClient.get(`/api/onboarding/verify-token?token=${encodeURIComponent(token)}`);
        if (res.data?.data?.valid) {
          setIsValid(true);
          setCandidateInfo({
            email: res.data.data.email,
            fullName: res.data.data.fullName,
            role: res.data.data.role,
          });
        } else {
          setIsValid(false);
          setErrorMessage('Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.');
        }
      } catch (err: any) {
        setIsValid(false);
        setErrorMessage(
          err.response?.data?.message || 'Liên kết kích hoạt đã hết hạn hoặc không hợp lệ. Vui lòng liên hệ HR để nhận hỗ trợ.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordPolicyRegex.test(password)) {
      setPasswordError('Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (@$!%*?&#).');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/api/onboarding/activate', {
        token,
        password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Không thể kích hoạt tài khoản. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    setResendStatus(null);
    try {
      const res = await apiClient.post('/api/onboarding/resend-activation', { email: resendEmail.trim() });
      setResendStatus(res.data?.message || 'Liên kết kích hoạt mới đã được gửi vào email của bạn!');
    } catch (err: any) {
      setResendStatus(err.response?.data?.message || 'Không thể gửi lại liên kết kích hoạt. Vui lòng kiểm tra lại email.');
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>InternHub</div>
          <p style={{ color: 'var(--text-muted)' }}>Đang xác thực liên kết onboarding...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '1rem' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-card)', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-md)', textAlign: 'center', border: '1px solid var(--border-default)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>Liên kết không khả dụng hoặc đã hết hạn</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            {errorMessage}
          </p>

          {/* Form yêu cầu cấp lại link kích hoạt */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginBottom: '1.25rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              Yêu cầu gửi lại liên kết kích hoạt
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Nhập email bạn đã ứng tuyển để nhận ngay đường link kích hoạt mới:
            </p>
            <form onSubmit={handleResendActivation} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="email.ung.vien@gmail.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={resendLoading}
                style={{
                  padding: '0.625rem',
                  borderRadius: '6px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  opacity: resendLoading ? 0.7 : 1,
                }}
              >
                {resendLoading ? 'Đang gửi...' : 'Gửi lại liên kết vào email'}
              </button>
            </form>
            {resendStatus && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--primary)', lineHeight: 1.4 }}>
                {resendStatus}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', background: 'var(--bg-body)', color: 'var(--text-main)', border: '1px solid var(--border-default)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Quay lại trang Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const isMentor = candidateInfo?.role === 'MENTOR';

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '1rem' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-card)', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-md)', textAlign: 'center', border: '1px solid var(--border-default)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>Kích hoạt thành công! 🎉</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Mật khẩu cho tài khoản <strong>{candidateInfo?.email}</strong> đã được thiết lập.{' '}
            {isMentor
              ? 'Chào mừng bạn đến với đội ngũ Người Hướng Dẫn Kỹ Thuật (Mentor) tại InternHub!'
              : 'Chào mừng bạn gia nhập chương trình thực tập!'}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            Đăng nhập vào hệ thống <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '1rem' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-card)', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-default)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>InternHub</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
            {isMentor ? 'Thiết Lập Tài Khoản Mentor' : 'Thiết Lập Tài Khoản Onboarding'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Xin chào <strong>{candidateInfo?.fullName}</strong>! Vui lòng thiết lập mật khẩu để hoàn tất bước{' '}
            {isMentor ? 'gia nhập đội ngũ Mentor.' : 'tiếp nhận.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Email tài khoản
            </label>
            <input
              type="text"
              value={candidateInfo?.email || ''}
              disabled
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-default)', background: 'var(--bg-body)', color: 'var(--text-muted)', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Mật khẩu mới (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.2rem', borderRadius: '6px', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.875rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Xác nhận mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.2rem', borderRadius: '6px', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.875rem' }}
              />
              <ShieldCheck size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {passwordError && (
            <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 500 }}>
              {passwordError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isSubmitting ? 'Đang kích hoạt...' : 'Hoàn tất kích hoạt'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingActivationPage;
