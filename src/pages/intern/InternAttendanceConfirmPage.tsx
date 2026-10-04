import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Clock,
  ArrowLeft,
  LogIn,
  User as UserIcon,
  Calendar,
  Building2,
  ShieldCheck,
  Sparkles,
  Lock,
  KeyRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { attendanceService } from '../../services/attendanceService';
import type { AttendanceRecordResponse } from '../../types';
import {
  formatDate,
  formatTime,
  getAttendanceStatusLabel,
} from '../../utils/formatters';

import styles from './InternAttendanceConfirmPage.module.css';

interface ConfirmPageState {
  notes: string;
  isSubmitting: boolean;
  errorMsg: string | null;
  confirmedRecord: AttendanceRecordResponse | null;
  countdown: number;
  loginUsername: string;
  loginPassword: string;
  isLoggingIn: boolean;
  loginError: string | null;
}

export const InternAttendanceConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, login } = useAuth();

  const token = searchParams.get('token')?.trim() || '';

  // Tuân thủ Nguyên tắc 14: Gom state object
  const [state, setState] = useState<ConfirmPageState>({
    notes: '',
    isSubmitting: false,
    errorMsg: null,
    confirmedRecord: null,
    countdown: 3,
    loginUsername: '',
    loginPassword: '',
    isLoggingIn: false,
    loginError: null,
  });

  const now = new Date();

  // Đóng cửa sổ thủ công (kèm fallback chuyển trang nếu trình duyệt chặn script)
  const handleCloseWindow = () => {
    try {
      window.close();
    } catch {
      // Bỏ qua lỗi trình duyệt chặn close()
    }
    setTimeout(() => {
      navigate(ROUTES.INTERN.DASHBOARD);
    }, 300);
  };

  // Tự động đếm ngược và đóng cửa sổ khi đã xác nhận thành công
  useEffect(() => {
    if (!state.confirmedRecord) return;

    if (state.countdown <= 0) {
      try {
        window.close();
      } catch {
        // Fallback
      }
      return;
    }

    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, countdown: prev.countdown - 1 }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.confirmedRecord, state.countdown]);

  // Xử lý đăng nhập nhanh tại chỗ nếu quét bằng điện thoại chưa có phiên
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.loginUsername.trim() || !state.loginPassword) {
      setState((prev) => ({
        ...prev,
        loginError: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoggingIn: true, loginError: null }));
    try {
      const loggedUser = await login(state.loginUsername.trim(), state.loginPassword);
      toast.success(`Đăng nhập thành công! Xin chào ${loggedUser.fullName || loggedUser.username}`);
      setState((prev) => ({ ...prev, isLoggingIn: false, loginError: null }));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setState((prev) => ({ ...prev, isLoggingIn: false, loginError: msg }));
      toast.error(msg);
    }
  };

  // Xử lý gửi xác nhận điểm danh Check-in
  const handleConfirm = async () => {
    if (!token) {
      toast.error('Không tìm thấy mã xác thực QR token trong liên kết.');
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, errorMsg: null }));

    try {
      const response = await attendanceService.confirmCheckIn({
        qrToken: token,
        notes: state.notes.trim() || undefined,
      });

      setState((prev) => ({
        ...prev,
        confirmedRecord: response,
        isSubmitting: false,
        countdown: 3,
      }));

      // Báo hiệu cho cửa sổ máy tính (tab cha) nếu có
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: 'ATTENDANCE_CHECKED_IN', record: response }, '*');
        } catch {
          // Bỏ qua lỗi postMessage nếu khác domain
        }
      }

      toast.success(
        `Check-in thành công! Trạng thái: ${
          response.status === 'ON_TIME' ? 'Đúng giờ' : 'Đi muộn'
        }`
      );
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        'Không thể xác nhận điểm danh. Phiên QR có thể đã hết hạn hoặc không hợp lệ.';
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        errorMsg: apiMessage,
      }));
      toast.error(apiMessage);
    }
  };

  return (
    <div className={styles.standaloneWrapper}>
      {/* Thanh Header độc lập mang nhận diện thương hiệu InternHub */}
      <header className={styles.brandHeader}>
        <div className={styles.brandLogoRow}>
          <div className={styles.brandIconBox}>
            <Building2 size={22} />
          </div>
          <div className={styles.brandNameText}>
            <span>InternHub</span>
            <span className={styles.brandDot}>•</span>
            <span className={styles.brandSub}>Điểm Danh Số</span>
          </div>
        </div>
        <div className={styles.secureBadge}>
          <ShieldCheck size={14} />
          <span>Bảo mật 2 bước</span>
        </div>
      </header>

      <main className={styles.confirmContainer}>
        {/* 1. TRƯỜNG HỢP: LIÊN KẾT KHÔNG CÓ TOKEN */}
        {!token ? (
          <div className={styles.confirmCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconDanger}`}>
                <AlertCircle size={30} />
              </div>
              <h1 className={styles.title}>Thiếu Mã Xác Thực QR</h1>
              <p className={styles.subtitle}>
                Liên kết không chứa mã xác thực phiên hợp lệ. Vui lòng quét lại mã QR điểm danh từ màn hình máy tính.
              </p>
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                onClick={() => navigate(ROUTES.INTERN.DASHBOARD)}
                className={styles.confirmButton}
              >
                <ArrowLeft size={16} />
                <span>Về Bảng Điều Khiển</span>
              </button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* 2. TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP TRÊN THIẾT BỊ NÀY (HỖ TRỢ INLINE LOGIN) */
          <div className={styles.confirmCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <KeyRound size={28} />
              </div>
              <h1 className={styles.title}>Đăng Nhập Xác Thực</h1>
              <p className={styles.subtitle}>
                Vui lòng đăng nhập tài khoản Thực tập sinh để hoàn tất xác nhận điểm danh phiên này.
              </p>
            </div>

            <form onSubmit={handleQuickLogin} className={styles.cardBody}>
              {state.loginError && (
                <div className={`${styles.alertBox} ${styles.alertDanger}`}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>{state.loginError}</div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="login-username" className={styles.formLabel}>
                  Tên đăng nhập:
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={state.loginUsername}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, loginUsername: e.target.value }))
                  }
                  placeholder="Nhập username của bạn..."
                  className={styles.formInput}
                  disabled={state.isLoggingIn}
                  autoComplete="username"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="login-password" className={styles.formLabel}>
                  Mật khẩu:
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={state.loginPassword}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, loginPassword: e.target.value }))
                  }
                  placeholder="Nhập mật khẩu..."
                  className={styles.formInput}
                  disabled={state.isLoggingIn}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className={styles.sessionHint}>
                <Sparkles size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Mã phiên QR đang được giữ an toàn trong URL của bạn.</span>
              </div>

              <div className={styles.cardFooter} style={{ padding: '0.5rem 0 0 0', border: 'none' }}>
                <button
                  type="submit"
                  disabled={state.isLoggingIn}
                  className={styles.confirmButton}
                >
                  {state.isLoggingIn ? (
                    <>
                      <Loader2 size={18} className={styles.spinning} />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Đăng Nhập & Tiếp Tục</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : role && !['INTERN', 'USER', 'ADMIN'].includes(role) ? (
          /* 3. TRƯỜNG HỢP: TÀI KHOẢN KHÔNG ĐÚNG PHÂN QUYỀN */
          <div className={styles.confirmCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
                <AlertTriangle size={30} />
              </div>
              <h1 className={styles.title}>Không Đúng Phân Quyền</h1>
              <p className={styles.subtitle}>
                Chức năng điểm danh QR chỉ áp dụng cho tài khoản Thực tập sinh (Intern). Tài khoản hiện tại có quyền <strong>{role}</strong>.
              </p>
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                onClick={() => navigate(ROUTES.ROOT)}
                className={styles.confirmButton}
              >
                <ArrowLeft size={16} />
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        ) : state.confirmedRecord ? (
          /* 4. TRƯỜNG HỢP: ĐÃ XÁC NHẬN THÀNH CÔNG -> HIỂN THỊ KẾT QUẢ & ĐẾM NGƯỢC ĐÓNG CỬA SỔ */
          <div className={styles.confirmCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
                <CheckCircle2 size={36} />
              </div>
              <h1 className={styles.title}>Điểm Danh Thành Công!</h1>
              <p className={styles.subtitle}>
                Hệ thống đã ghi nhận ca làm việc của bạn vào cơ sở dữ liệu.
              </p>
            </div>

            <div className={styles.cardBody}>
              {/* Thanh thông báo tự động đóng cửa sổ kèm tiến trình */}
              <div className={styles.autoCloseBanner}>
                <div className={styles.autoCloseTextRow}>
                  <Loader2 size={16} className={styles.spinning} />
                  <span>
                    Cửa sổ sẽ tự động đóng sau <strong>{state.countdown}s</strong>...
                  </span>
                </div>
                <div className={styles.countdownTrack}>
                  <div
                    className={styles.countdownFill}
                    style={{ width: `${(state.countdown / 3) * 100}%` }}
                  />
                </div>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span>Thực tập sinh:</span>
                  <strong>{user?.fullName || user?.username || '—'}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Ngày làm việc:</span>
                  <strong>{formatDate(state.confirmedRecord.workDate)}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Giờ check-in:</span>
                  <strong>{formatTime(state.confirmedRecord.checkInTime, true)}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Trạng thái:</span>
                  <span
                    className={
                      state.confirmedRecord.status === 'ON_TIME'
                        ? styles.statusBadgeOnTime
                        : styles.statusBadgeLate
                    }
                  >
                    {getAttendanceStatusLabel(state.confirmedRecord.status)}
                  </span>
                </div>
                {state.confirmedRecord.notes && (
                  <div className={styles.infoRow}>
                    <span>Ghi chú:</span>
                    <span style={{ color: 'var(--text-main)', textAlign: 'right', maxWidth: '60%' }}>
                      {state.confirmedRecord.notes}
                    </span>
                  </div>
                )}
              </div>

              <div className={`${styles.alertBox} ${styles.alertSuccess}`}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1, color: 'var(--success)' }} />
                <div>
                  Cảm ơn bạn đã điểm danh đúng quy trình. Chúc bạn có một ca làm việc tràn đầy năng lượng!
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button
                type="button"
                onClick={handleCloseWindow}
                className={styles.confirmButton}
              >
                <X size={16} />
                <span>Đóng Cửa Sổ Ngay</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.INTERN.DASHBOARD)}
                className={styles.backButton}
              >
                <ArrowLeft size={16} />
                <span>Về Bảng Điều Khiển</span>
              </button>
            </div>
          </div>
        ) : (
          /* 5. TRƯỜNG HỢP: SẴN SÀNG XÁC NHẬN ĐIỂM DANH (GIAO DIỆN CHÍNH DEDICATED) */
          <div className={styles.confirmCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <QrCode size={28} />
              </div>
              <h1 className={styles.title}>Xác Nhận Check-in</h1>
              <p className={styles.subtitle}>
                Xác thực phiên điểm danh 2 bước bảo mật bằng mã QR
              </p>
            </div>

            <div className={styles.cardBody}>
              {/* Thông báo lỗi nếu có */}
              {state.errorMsg && (
                <div className={`${styles.alertBox} ${styles.alertDanger}`}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Lỗi điểm danh:</strong> {state.errorMsg}
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                      Phiên QR chỉ có hiệu lực trong 60 giây. Nếu đã hết hạn, vui lòng làm mới mã QR trên máy tính và quét lại.
                    </p>
                  </div>
                </div>
              )}

              {/* Hộp thông tin phiên điểm danh */}
              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <UserIcon size={15} style={{ color: 'var(--primary)' }} />
                    Thực tập sinh:
                  </span>
                  <strong>{user?.fullName || user?.username || '—'}</strong>
                </div>

                <div className={styles.infoRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} style={{ color: 'var(--primary)' }} />
                    Ngày làm việc:
                  </span>
                  <strong>{formatDate(now)}</strong>
                </div>

                <div className={styles.infoRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} style={{ color: 'var(--primary)' }} />
                    Thời gian quét:
                  </span>
                  <strong>{formatTime(now, true)}</strong>
                </div>

                <div className={styles.infoRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={15} style={{ color: 'var(--primary)' }} />
                    Văn phòng:
                  </span>
                  <strong>Trụ sở chính InternHub</strong>
                </div>

                <div className={styles.infoRow}>
                  <span>Mã phiên QR:</span>
                  <span className={styles.tokenPreview} title={token}>
                    {token.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Form ghi chú điểm danh tuỳ chọn */}
              <div className={styles.formGroup}>
                <label htmlFor="confirm-attendance-notes" className={styles.formLabel}>
                  Ghi chú điểm danh (Tuỳ chọn):
                </label>
                <textarea
                  id="confirm-attendance-notes"
                  value={state.notes}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Ví dụ: Làm việc tại tầng 3, gặp mentor buổi sáng..."
                  maxLength={255}
                  disabled={state.isSubmitting}
                  className={styles.formTextarea}
                />
                <span className={styles.charCount}>
                  {state.notes.length}/255 ký tự
                </span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={state.isSubmitting}
                className={styles.confirmButton}
              >
                {state.isSubmitting ? (
                  <>
                    <Loader2 size={18} className={styles.spinning} />
                    <span>Đang xác nhận điểm danh...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Xác Nhận Check-in Vào Ca</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCloseWindow}
                disabled={state.isSubmitting}
                className={styles.backButton}
              >
                <X size={16} />
                <span>Đóng Cửa Sổ</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InternAttendanceConfirmPage;
