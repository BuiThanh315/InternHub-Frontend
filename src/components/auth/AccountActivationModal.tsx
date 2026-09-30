import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Info,
  KeyRound,
  Mail,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Alert } from '../common/Alert/Alert';
import { Button } from '../common/Button/Button';
import { Modal } from '../common/Modal/Modal';
import { OtpInput } from './OtpInput';

import { useOtpCountdown } from '../../hooks/useOtpCountdown';
import { useOtpInput } from '../../hooks/useOtpInput';
import { authService } from '../../services/authService';

import type { AccountActivationModalProps } from './AccountActivationModal.types';
import styles from './AccountActivationModal.module.css';

export const AccountActivationModal: React.FC<AccountActivationModalProps> = ({
  isOpen,
  onClose,
  identifier,
  maskedEmail,
  onActivationSuccess,
  onBackToRegister,
}) => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const {
    digits,
    otpValue,
    isComplete,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    clearOtp,
    focusFirst,
  } = useOtpInput(6);

  const {
    formattedExpiry,
    isExpired,
    cooldownSeconds,
    isCooldownActive,
    startCooldown,
    resetExpiry,
  } = useOtpCountdown({
    initialExpiryMinutes: 15,
    initialCooldownSeconds: 60,
    autoStartCooldown: true,
  });

  // Reset form & focus input đầu tiên khi modal mở
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      clearOtp();
      const timer = setTimeout(() => {
        focusFirst();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, clearOtp, focusFirst]);

  // Xóa lỗi khi người dùng bắt đầu sửa lại các ô nhập
  const onDigitChange = (index: number, value: string) => {
    if (errorMsg) setErrorMsg(null);
    handleChange(index, value);
  };

  // Kích hoạt animation rung nhẹ khi có lỗi
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  // Xử lý gửi mã OTP kích hoạt
  const handleVerify = async () => {
    if (!isComplete || loading || isExpired) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      await authService.activateAccount({
        identifier: identifier.trim(),
        activationKey: otpValue.trim(),
      });

      toast.success('Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.');
      onActivationSuccess?.(identifier);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Mã kích hoạt không chính xác hoặc đã hết hạn.';
      setErrorMsg(msg);
      triggerShake();

      // Nếu hết số lần thử hoặc hết hạn thì xóa ô
      if (msg.includes('quá 5 lần') || msg.includes('hết hạn')) {
        clearOtp();
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi lại mã OTP mới
  const handleResend = async () => {
    if (isCooldownActive || resending) return;

    try {
      setResending(true);
      setErrorMsg(null);

      const res = await authService.resendActivation({
        identifier: identifier.trim(),
      });

      toast.success(
        res?.maskedEmail
          ? `Mã kích hoạt mới đã được gửi tới ${res.maskedEmail}.`
          : 'Mã kích hoạt mới đã được gửi vào hòm thư của bạn.'
      );

      clearOtp();
      resetExpiry(res?.expiresInMinutes || 15);
      startCooldown(res?.cooldownSeconds || 60);
      focusFirst();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi lại mã kích hoạt vào lúc này. Vui lòng thử lại sau.';
      setErrorMsg(msg);
    } finally {
      setResending(false);
    }
  };

  // Submit bằng form
  const handleFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    handleVerify();
  };

  // Tính nhãn nút Gửi lại mã
  let resendButtonLabel = 'Gửi lại mã kích hoạt';
  if (isCooldownActive) {
    resendButtonLabel = `Gửi lại mã (${cooldownSeconds}s)`;
  } else if (resending) {
    resendButtonLabel = 'Đang gửi...';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleFormSubmit}>
        {/* Header Khối 1: Cố định */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <ShieldCheck size={28} />
          </div>
          <h3 className={styles.title}>Kích Hoạt Tài Khoản Thực Tập Sinh</h3>
          <p className={styles.subtitle}>
            Nhập mã xác thực gồm 6 chữ số vừa được gửi đến email cá nhân của bạn để hoàn tất mở khóa tài khoản.
          </p>
          {maskedEmail && (
            <div className={styles.emailBadge}>
              <Mail size={14} />
              <span>{maskedEmail}</span>
            </div>
          )}
        </div>

        {/* Body Khối 2: Cuộn độc lập */}
        <div className={styles.body}>
          {/* Hộp chỉ dẫn thân thiện */}
          <div className={styles.noticeBox}>
            <Info size={16} className={styles.noticeIcon} />
            <span>
              Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam/Quảng cáo). Mã có thể mất từ 10–30 giây để tới hộp thư của bạn.
            </span>
          </div>

          {/* Cảnh báo lỗi từ Backend nếu có */}
          {errorMsg && (
            <div className={styles.alertBox}>
              <Alert type="error" title="Xác thực không thành công">
                {errorMsg}
              </Alert>
            </div>
          )}

          {/* Cảnh báo hết hạn */}
          {isExpired && !errorMsg && (
            <div className={styles.alertBox}>
              <Alert type="warning" title="Mã xác thực đã hết hạn">
                Mã kích hoạt đã quá 15 phút. Vui lòng bấm &ldquo;Gửi lại mã kích hoạt&rdquo; bên dưới để nhận mã mới.
              </Alert>
            </div>
          )}

          {/* Cụm 6 ô nhập số độc lập */}
          <OtpInput
            digits={digits}
            inputRefs={inputRefs}
            onChange={onDigitChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={loading || resending || isExpired}
            isError={Boolean(errorMsg)}
            isShaking={isShaking}
          />

          {/* Dòng hiển thị thời hạn OTP */}
          <div className={styles.timerRow}>
            <span>Thời gian hiệu lực của mã:</span>
            <div
              className={`${styles.expiryBadge} ${
                isExpired || (digits.join('') && errorMsg) ? styles.expiryWarning : ''
              }`}
            >
              <Clock size={14} />
              <span>{formattedExpiry}</span>
            </div>
          </div>

          {/* Khu vực Gửi lại mã */}
          <div className={styles.resendContainer}>
            <span>Chưa nhận được email xác thực?</span>
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResend}
              disabled={isCooldownActive || resending || loading}
              aria-label="Gửi lại mã xác thực kích hoạt"
            >
              <RotateCcw size={13} className={resending ? 'animate-spin' : ''} />
              <span>{resendButtonLabel}</span>
            </button>
          </div>
        </div>

        {/* Footer Khối 3: Sticky Pinned */}
        <div className={styles.footer}>
          {onBackToRegister ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBackToRegister}
              disabled={loading || resending}
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || resending}
            >
              <span>Đóng</span>
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={!isComplete || loading || isExpired}
          >
            <KeyRound size={16} />
            <span>Xác Thực & Kích Hoạt</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AccountActivationModal;
