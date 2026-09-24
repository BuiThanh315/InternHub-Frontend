import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  User as UserIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../contexts/AuthContext";
import type { RoleType } from "../../types";
import { Alert } from "../common/Alert/Alert";
import { Button } from "../common/Button/Button";
import { Modal } from "../common/Modal/Modal";
import styles from "./LoginModal.module.css";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExpired?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isExpired = false,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleRedirect = (role: RoleType | string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const authUser = await login(username.trim(), password);
      toast.success(`Chào mừng ${authUser.fullName || authUser.username}!`);
      onClose();
      handleRedirect(authUser.role);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản.";
      setError(msg);
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

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

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
              placeholder="admin, hr_manager, ..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
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
      </form>
    </Modal>
  );
};

export default LoginModal;
