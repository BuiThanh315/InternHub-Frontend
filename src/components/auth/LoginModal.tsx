import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  User as UserIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../contexts/AuthContext";
import type { RoleType } from "../../types";
import { Alert } from "../common/Alert/Alert";
import { Button } from "../common/Button/Button";
import { Modal } from "../common/Modal/Modal";
import { GoogleSignInButton } from "./GoogleSignInButton";
import styles from "./LoginModal.module.css";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExpired?: boolean;
  onSwitchToRegister?: () => void;
  onOpenActivation?: (identifier: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isExpired = false,
  onSwitchToRegister,
  onOpenActivation,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsActivation, setNeedsActivation] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setNeedsActivation(false);
      setRememberMe(false);
    }
  }, [isOpen]);

  const handleRedirect = (role: RoleType | string) => {
    const redirectParam = searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/") && redirectParam !== "/" && redirectParam !== "/login") {
      navigate(redirectParam, { replace: true });
      return;
    }

    switch (role) {
      case "ADMIN":
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
        break;
      case "HR":
        navigate(ROUTES.HR.DASHBOARD, { replace: true });
        break;
      case "MENTOR":
        navigate(ROUTES.MENTOR.DASHBOARD, { replace: true });
        break;
      case "INTERN":
      default:
        navigate(ROUTES.INTERN.DASHBOARD, { replace: true });
        break;
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      setNeedsActivation(false);
      const authUser = await loginWithGoogle(idToken);
      toast.success(`Chào mừng ${authUser.fullName || authUser.username}!`);
      onClose();
      handleRedirect(authUser.role);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng nhập bằng tài khoản Google không thành công. Vui lòng thử lại.";
      setError(msg);
      if (
        msg.toLowerCase().includes("kích hoạt") ||
        msg.toLowerCase().includes("activation") ||
        msg.toLowerCase().includes("pending_activation")
      ) {
        setNeedsActivation(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorMessage?: string) => {
    if (errorMessage) {
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      setNeedsActivation(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNeedsActivation(false);
      const authUser = await login(username.trim(), password, rememberMe);
      toast.success(`Chào mừng ${authUser.fullName || authUser.username}!`);
      onClose();
      handleRedirect(authUser.role);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản.";
      setError(msg);
      if (
        msg.toLowerCase().includes("kích hoạt") ||
        msg.toLowerCase().includes("activation") ||
        msg.toLowerCase().includes("pending_activation")
      ) {
        setNeedsActivation(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Building2 size={24} />
        </div>
        <h3 className={styles.title}>Đăng Nhập Cổng Nội Bộ</h3>
        <p className={styles.subtitle}>
          Dành cho cán bộ quản lý, nhân sự, mentor và thực tập sinh đã có tài
          khoản
        </p>
      </div>

      {isExpired && (
        <Alert
          type="warning"
          message="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục làm việc."
          className="mb-4"
        />
      )}

      {needsActivation && (
        <div className={styles.activationAlertBox}>
          <div className={styles.activationAlertHeader}>
            <AlertCircle size={20} className="shrink-0" />
            <span>
              {error || 'Tài khoản của bạn chưa được kích hoạt qua mã OTP email.'}
            </span>
          </div>
          <div className={styles.activationAlertActions}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenActivation?.(username.trim());
              }}
            >
              Nhập mã OTP kích hoạt ngay
            </Button>
          </div>
        </div>
      )}

      {!needsActivation && error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      <div className={styles.oauthSection}>
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={loading}
          isLoading={loading}
        />
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>hoặc đăng nhập với mật khẩu</span>
          <span className={styles.dividerLine} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="login-username" className={styles.label}>Tên đăng nhập / Email</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <UserIcon size={18} />
            </span>
            <input
              id="login-username"
              type="text"
              required
              disabled={loading}
              className={styles.input}
              placeholder="admin, hr_manager, ..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="login-password" className={styles.label}>Mật khẩu</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Lock size={18} />
            </span>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
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
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.rememberMeRow}>
          <label className={styles.rememberMeLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              disabled={loading}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.rememberMeCheckbox}
            />
            <span>Ghi nhớ đăng nhập trên thiết bị này</span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          isLoading={loading}
          leftIcon={<LogIn size={18} />}
          fullWidth
          className={styles.submitBtn}
        >
          {loading ? "Đang xác thực..." : "Đăng Nhập"}
        </Button>

        {onSwitchToRegister && (
          <div className={styles.switchPrompt}>
            <span>Chưa có tài khoản thực tập sinh?</span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className={styles.switchLink}
            >
              Đăng ký ngay
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default LoginModal;
