import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

import { authService } from '../../services/authService';
import type { GenderType, RegisterRequest } from '../../types';
import { Alert } from '../common/Alert/Alert';
import { Button } from '../common/Button/Button';
import { Modal } from '../common/Modal/Modal';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import styles from './RegisterModal.module.css';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Tên đăng nhập từ 4 đến 50 ký tự')
      .max(50, 'Tên đăng nhập từ 4 đến 50 ký tự')
      .regex(/^\w+$/, 'Chỉ chứa chữ cái, số và dấu gạch dưới'),
    password: z
      .string()
      .min(8, 'Mật khẩu tối thiểu 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ in hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ in thường')
      .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số')
      .regex(/[@$!%*?&#]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&#)'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu'),
    fullName: z
      .string()
      .min(2, 'Họ và tên từ 2 đến 100 ký tự')
      .max(100, 'Họ và tên tối đa 100 ký tự'),
    email: z.string().email('Email không đúng định dạng'),
    phoneNumber: z
      .string()
      .regex(/^0[35789]\d{8}$/, 'Số điện thoại di động VN gồm 10 chữ số (VD: 0912345678)'),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().max(255, 'Địa chỉ không vượt quá 255 ký tự').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  onRegisterSuccess?: (registeredUser: {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth?: string;
    gender?: GenderType;
    address?: string;
  }) => void;
  onRequireActivation?: (data: { identifier: string; maskedEmail?: string }) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
  onRequireActivation,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: 'MALE',
      address: '',
    },
    mode: 'onTouched',
  });

  const passwordValue = watch('password');

  // Reset khi mở hoặc đóng modal
  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      setCurrentStep(1);
    } else {
      reset();
      setCurrentStep(1);
    }
  }, [isOpen, reset]);

  // Xử lý chuyển từ Bước 1 sang Bước 2 (Kiểm tra hợp lệ tài khoản)
  const handleNextToStep2 = async () => {
    setServerError(null);
    const isStep1Valid = await trigger(['username', 'password', 'confirmPassword']);
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  // Quay lại Bước 1
  const handleBackToStep1 = () => {
    setServerError(null);
    setCurrentStep(1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      const payload: RegisterRequest = {
        username: data.username.trim(),
        password: data.password,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phoneNumber: data.phoneNumber.trim(),
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
        gender: data.gender,
        address: data.address?.trim() || undefined,
      };

      const res = await authService.register(payload);
      toast.success('Đăng ký tài khoản thành công! Vui lòng nhập mã OTP để kích hoạt tài khoản.');

      onRegisterSuccess?.({
        userId: res.userId,
        username: res.username,
        fullName: res.fullName,
        email: res.email,
        phoneNumber: data.phoneNumber.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address?.trim(),
      });

      if (onRequireActivation) {
        onRequireActivation({
          identifier: res.username,
          maskedEmail: res.maskedEmail || res.email,
        });
      }

      onClose();
    } catch (err: any) {
      const msg =
        err?.message ||
        'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin và thử lại.';
      setServerError(msg);
      // Nếu lỗi liên quan đến tên đăng nhập trùng, có thể cho phép người dùng quay lại Bước 1
      if (msg.toLowerCase().includes('tên đăng nhập') || msg.toLowerCase().includes('username')) {
        setCurrentStep(1);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <ShieldCheck size={24} />
        </div>
        <h3 className={styles.title}>Đăng Ký Tài Khoản Thực Tập Sinh</h3>
        <p className={styles.subtitle}>
          {currentStep === 1
            ? 'Bước 1: Thiết lập tên đăng nhập và mật khẩu bảo mật'
            : 'Bước 2: Cung cấp thông tin cá nhân để liên kết hồ sơ'}
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className={styles.stepperContainer}>
        {/* Step 1 Bubble */}
        <div className={styles.stepItem}>
          <div
            className={`${styles.stepBubble} ${
              currentStep === 1 ? styles.active : styles.completed
            }`}
          >
            {currentStep > 1 ? <Check size={14} /> : '1'}
          </div>
          <span
            className={`${styles.stepTitle} ${
              currentStep === 1 ? styles.active : styles.completed
            }`}
          >
            Tài khoản
          </span>
        </div>

        {/* Connector Line */}
        <div
          className={`${styles.stepLine} ${
            currentStep > 1 ? styles.completed : ''
          }`}
        />

        {/* Step 2 Bubble */}
        <div className={styles.stepItem}>
          <div
            className={`${styles.stepBubble} ${
              currentStep === 2 ? styles.active : ''
            }`}
          >
            2
          </div>
          <span
            className={`${styles.stepTitle} ${
              currentStep === 2 ? styles.active : ''
            }`}
          >
            Thông tin cá nhân
          </span>
        </div>
      </div>

      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* ==================== BƯỚC 1: THÔNG TIN TÀI KHOẢN ==================== */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            {/* Username */}
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-step-username" className={styles.label}>
                Tên đăng nhập <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <UserIcon size={16} />
                </span>
                <input
                  id="reg-step-username"
                  type="text"
                  disabled={isSubmitting}
                  className={`${styles.input} ${errors.username ? styles.hasError : ''}`}
                  placeholder="VD: nguyenvana"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <span className={styles.fieldError}>{errors.username.message}</span>
              )}
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-step-password" className={styles.label}>
                Mật khẩu <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Lock size={16} />
                </span>
                <input
                  id="reg-step-password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isSubmitting}
                  className={`${styles.input} ${errors.password ? styles.hasError : ''}`}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePasswordBtn}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.fieldError}>{errors.password.message}</span>
              )}
              <PasswordStrengthMeter password={passwordValue || ''} />
            </div>

            {/* Confirm Password */}
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-step-confirmPassword" className={styles.label}>
                Xác nhận mật khẩu <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Lock size={16} />
                </span>
                <input
                  id="reg-step-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  disabled={isSubmitting}
                  className={`${styles.input} ${errors.confirmPassword ? styles.hasError : ''}`}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.togglePasswordBtn}
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Step 1 Actions */}
            <div className={styles.footer}>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleNextToStep2}
                rightIcon={<ArrowRight size={18} />}
                fullWidth
              >
                Tiếp Tục (Bước 2: Thông Tin Cá Nhân)
              </Button>

              {onSwitchToLogin && (
                <div className={styles.switchAuthPrompt}>
                  <span>Đã có tài khoản?</span>
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className={styles.switchLink}
                  >
                    Đăng nhập tại đây
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== BƯỚC 2: THÔNG TIN CÁ NHÂN ==================== */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            {/* Full Name */}
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-step-fullName" className={styles.label}>
                Họ và tên <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <UserIcon size={16} />
                </span>
                <input
                  id="reg-step-fullName"
                  type="text"
                  disabled={isSubmitting}
                  className={`${styles.input} ${errors.fullName ? styles.hasError : ''}`}
                  placeholder="VD: Nguyễn Văn A"
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <span className={styles.fieldError}>{errors.fullName.message}</span>
              )}
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-step-email" className={styles.label}>
                Email liên hệ <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Mail size={16} />
                </span>
                <input
                  id="reg-step-email"
                  type="email"
                  disabled={isSubmitting}
                  className={`${styles.input} ${errors.email ? styles.hasError : ''}`}
                  placeholder="VD: nguyenvana@gmail.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className={styles.fieldError}>{errors.email.message}</span>
              )}
            </div>

            {/* Phone Number */}
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-step-phoneNumber" className={styles.label}>
                Số điện thoại <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Phone size={16} />
                </span>
                <input
                  id="reg-step-phoneNumber"
                  type="tel"
                  disabled={isSubmitting}
                  className={`${styles.input} ${errors.phoneNumber ? styles.hasError : ''}`}
                  placeholder="VD: 0987654321"
                  {...register('phoneNumber')}
                />
              </div>
              {errors.phoneNumber && (
                <span className={styles.fieldError}>{errors.phoneNumber.message}</span>
              )}
            </div>

            {/* Date of Birth & Gender */}
            <div className={styles.rowTwoCols}>
              <div className={styles.fieldGroup}>
                <label htmlFor="reg-step-dob" className={styles.label}>Ngày sinh</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <Calendar size={16} />
                  </span>
                  <input
                    id="reg-step-dob"
                    type="date"
                    disabled={isSubmitting}
                    className={styles.input}
                    {...register('dateOfBirth')}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-step-gender" className={styles.label}>Giới tính</label>
                <select
                  id="reg-step-gender"
                  disabled={isSubmitting}
                  className={styles.select}
                  {...register('gender')}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-step-address" className={styles.label}>Địa chỉ cư trú</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <MapPin size={16} />
                </span>
                <input
                  id="reg-step-address"
                  type="text"
                  disabled={isSubmitting}
                  className={styles.input}
                  placeholder="VD: Cầu Giấy, Hà Nội"
                  {...register('address')}
                />
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className={styles.footer}>
              <div className={styles.stepActions}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handleBackToStep1}
                  leftIcon={<ArrowLeft size={16} />}
                  className={styles.backBtn}
                >
                  Quay Lại
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  leftIcon={<UserPlus size={18} />}
                  className={styles.nextBtn}
                >
                  {isSubmitting ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}
                </Button>
              </div>

              {onSwitchToLogin && (
                <div className={styles.switchAuthPrompt}>
                  <span>Đã có tài khoản?</span>
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className={styles.switchLink}
                  >
                    Đăng nhập tại đây
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default RegisterModal;
