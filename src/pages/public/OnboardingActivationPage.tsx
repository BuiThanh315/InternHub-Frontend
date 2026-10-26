import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../services/api';
import styles from './OnboardingActivationPage.module.css';

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
      <div className={styles.container}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.brandTitle}>InternHub</div>
          <p className={styles.cardSubtitle}>Đang xác thực liên kết onboarding...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={styles.container}>
        <div className={styles.centerCard}>
          <div className={styles.iconCircleDanger}>
            <AlertCircle size={28} />
          </div>
          <h3 className={styles.cardTitle}>Liên kết không khả dụng hoặc đã hết hạn</h3>
          <p className={styles.cardSubtitle} style={{ marginBottom: '1.5rem' }}>
            {errorMessage}
          </p>

          {/* Form yêu cầu cấp lại link kích hoạt */}
          <div className={styles.resendSection}>
            <h4 className={styles.resendTitle}>
              Yêu cầu gửi lại liên kết kích hoạt
            </h4>
            <p className={styles.resendDesc}>
              Nhập email bạn đã ứng tuyển để nhận ngay đường link kích hoạt mới:
            </p>
            <form onSubmit={handleResendActivation} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="email.ung.vien@gmail.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                className={styles.resendInput}
              />
              <button
                type="submit"
                disabled={resendLoading}
                className={styles.submitBtn}
              >
                {resendLoading ? 'Đang gửi...' : 'Gửi lại liên kết vào email'}
              </button>
            </form>
            {resendStatus && (
              <p className={styles.resendStatus}>
                {resendStatus}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className={styles.backBtn}
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
      <div className={styles.container}>
        <div className={styles.centerCard}>
          <div className={styles.iconCircleSuccess}>
            <CheckCircle2 size={28} />
          </div>
          <h3 className={styles.cardTitle}>Kích hoạt thành công! 🎉</h3>
          <p className={styles.cardSubtitle} style={{ marginBottom: '1.5rem' }}>
            Mật khẩu cho tài khoản <strong>{candidateInfo?.email}</strong> đã được thiết lập.{' '}
            {isMentor
              ? 'Chào mừng bạn đến với đội ngũ Người Hướng Dẫn Kỹ Thuật (Mentor) tại InternHub!'
              : 'Chào mừng bạn gia nhập chương trình thực tập!'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={styles.submitBtn}
            style={{ width: '100%' }}
          >
            Đăng nhập vào hệ thống <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className={styles.brandTitle}>InternHub</div>
          <h3 className={styles.cardTitle}>
            {isMentor ? 'Thiết Lập Tài Khoản Mentor' : 'Thiết Lập Tài Khoản Onboarding'}
          </h3>
          <p className={styles.cardSubtitle}>
            Xin chào <strong>{candidateInfo?.fullName}</strong>! Vui lòng thiết lập mật khẩu để hoàn tất bước{' '}
            {isMentor ? 'gia nhập đội ngũ Mentor.' : 'tiếp nhận.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Email tài khoản
            </label>
            <input
              type="text"
              value={candidateInfo?.email || ''}
              disabled
              className={styles.inputDisabled}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Mật khẩu mới (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt)
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.inputWithIcon}
              />
              <Lock size={16} className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Xác nhận mật khẩu mới
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.inputWithIcon}
              />
              <ShieldCheck size={16} className={styles.inputIcon} />
            </div>
          </div>

          {passwordError && (
            <div className={styles.errorText}>
              {passwordError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? 'Đang kích hoạt...' : 'Hoàn tất kích hoạt'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingActivationPage;
