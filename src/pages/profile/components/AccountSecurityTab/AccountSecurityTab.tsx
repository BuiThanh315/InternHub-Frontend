import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Lock, Eye, EyeOff, Info } from 'lucide-react';
import { Input, Button, Alert } from '../../../../components/common';
import { PasswordStrengthMeter } from '../../../../components/auth/PasswordStrengthMeter';
import { profileService } from '../../../../services/profileService';
import { ChangePasswordSchema, type ChangePasswordFormData } from '../../../../types';
import type { AccountSecurityTabProps } from './AccountSecurityTab.types';
import styles from './AccountSecurityTab.module.css';

export const AccountSecurityTab: React.FC<AccountSecurityTabProps> = ({ onSuccess }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const newPasswordValue = watch('newPassword') || '';

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    try {
      const res = await profileService.changePassword(data);
      setFormSuccessMessage(res.message || 'Mật khẩu của bạn đã được thay đổi thành công!');
      reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại thông tin';

      // Nếu lỗi từ Backend chỉ ra mật khẩu cũ không đúng
      if (errorMsg.toLowerCase().includes('hiện tại') || errorMsg.toLowerCase().includes('current')) {
        setError('currentPassword', {
          type: 'manual',
          message: 'Mật khẩu hiện tại không chính xác',
        });
      } else {
        setFormErrorMessage(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.tabCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Bảo Mật & Mật Khẩu Tài Khoản</h3>
        <p className={styles.cardSubtitle}>
          Quản lý mật khẩu đăng nhập và tiêu chuẩn bảo vệ an toàn cho tài khoản
        </p>
      </div>

      <div className={styles.securityNotice}>
        <Info size={18} className={styles.noticeIcon} />
        <div>
          <strong>Lưu ý bảo mật:</strong> Để bảo vệ phiên làm việc của bạn, hệ thống yêu cầu xác
          thực mật khẩu hiện tại trước khi tạo mật khẩu mới. Mật khẩu mới cần có độ dài tối thiểu 8
          ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
        </div>
      </div>

      {formSuccessMessage && (
        <div style={{ marginTop: '1rem' }}>
          <Alert type="success" title="Cập nhật mật khẩu thành công" message={formSuccessMessage} />
        </div>
      )}

      {formErrorMessage && (
        <div style={{ marginTop: '1rem' }}>
          <Alert type="error" title="Không thể đổi mật khẩu" message={formErrorMessage} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.securityForm} style={{ marginTop: '1.25rem' }}>
        {/* Mật khẩu hiện tại */}
        <Input
          label="Mật khẩu hiện tại"
          type={showCurrentPassword ? 'text' : 'password'}
          placeholder="Nhập mật khẩu bạn đang sử dụng"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
              aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        {/* Mật khẩu mới */}
        <div>
          <Input
            label="Mật khẩu mới"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Tối thiểu 8 ký tự, chữ hoa, số & ký tự đặc biệt"
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          {/* Thanh đo độ mạnh mật khẩu - D-06 */}
          {newPasswordValue && (
            <div style={{ marginTop: '0.5rem' }}>
              <PasswordStrengthMeter password={newPasswordValue} />
            </div>
          )}
        </div>

        {/* Xác nhận mật khẩu mới */}
        <Input
          label="Xác nhận mật khẩu mới"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Nhập lại mật khẩu mới vừa đặt"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className={styles.buttonRow}>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<ShieldCheck size={16} />}
          >
            Lưu Mật Khẩu Mới
          </Button>
        </div>
      </form>
    </div>
  );
};
