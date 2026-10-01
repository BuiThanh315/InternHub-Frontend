import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Modal, Button, Input, Select } from '../../../../components/common';
import { profileService } from '../../../../services/profileService';
import { internService } from '../../../../services/internService';
import { useAuth } from '../../../../contexts/AuthContext';
import { PersonalInfoSchema, type PersonalInfoFormData, type User } from '../../../../types';
import type { EditProfileModalProps } from './EditProfileModal.types';
import styles from './EditProfileModal.module.css';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  internProfile,
  onSuccess,
}) => {
  const { role, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: undefined,
      address: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phone || user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender,
        address: user.address || '',
        bio: user.bio || '',
      });
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    if (!user?.id) {
      toast.error('Không tìm thấy định danh tài khoản người dùng.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Gọi API Self-Service chung cho cả 4 role (PUT /api/users/me)
      const updatedUser = await profileService.updatePersonalInfo({
        fullName: user.fullName || data.fullName,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        phone: data.phoneNumber?.trim() || undefined,
        gender: data.gender,
        address: data.address?.trim() || undefined,
        bio: data.bio?.trim() || undefined,
      });

      // Cập nhật AuthContext tức thì (Header & Sidebar đồng bộ)
      updateUser({
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber || updatedUser.phone,
        phone: updatedUser.phone || updatedUser.phoneNumber,
        address: updatedUser.address,
      });

      onSuccess(updatedUser);
      toast.success('Cập nhật thông tin cá nhân thành công!');
      onClose();
    } catch (err: unknown) {
      console.error('Lỗi khi cập nhật hồ sơ cá nhân:', err);
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.';
      toast.error(msg);
      // Giữ nguyên Modal và dữ liệu theo Quy tắc 24
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh Sửa Thông Tin Cá Nhân"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            form="edit-profile-form"
            variant="primary"
            isLoading={isSubmitting}
          >
            Lưu Thay Đổi
          </Button>
        </div>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          {/* Nhóm A: Họ và tên (Khóa pháp lý - Nhất quán 4 role) */}
          <div>
            <Input
              label="Họ và tên"
              disabled
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            <p className={styles.disabledHint}>Họ và tên gắn liền với hồ sơ pháp lý, chỉ có thể điều chỉnh qua Ban Nhân Sự.</p>
          </div>

          {/* Nhóm A: Email (Khóa định danh - Nhất quán 4 role) */}
          <div>
            <Input
              label="Email định danh"
              disabled
              {...register('email')}
              error={errors.email?.message}
            />
            <p className={styles.disabledHint}>Email định danh không thể thay đổi trực tiếp để bảo vệ tài khoản.</p>
          </div>

          {/* Nhóm B: Số điện thoại (Tự do chỉnh sửa) */}
          <Input
            label="Số điện thoại"
            placeholder="Ví dụ: 0912345678"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />

          {/* Nhóm A: Ngày sinh (Khóa pháp lý - Nhất quán 4 role) */}
          <div>
            <Input
              label="Ngày sinh"
              type="date"
              disabled
              {...register('dateOfBirth')}
              error={errors.dateOfBirth?.message}
            />
            <p className={styles.disabledHint}>Ngày sinh gắn với giấy tờ tùy thân, chỉ có thể điều chỉnh qua Ban Nhân Sự.</p>
          </div>

          {/* Nhóm B: Giới tính (Tự do chỉnh sửa) */}
          <Select
            label="Giới tính"
            options={[
              { value: '', label: '-- Chọn giới tính --' },
              { value: 'MALE', label: 'Nam' },
              { value: 'FEMALE', label: 'Nữ' },
              { value: 'OTHER', label: 'Khác' },
            ]}
            {...register('gender')}
            error={errors.gender?.message}
          />

          {/* Địa chỉ */}
          <div className={styles.fullWidth}>
            <Input
              label="Địa chỉ liên lạc"
              placeholder="Nhập địa chỉ cư trú hiện tại"
              {...register('address')}
              error={errors.address?.message}
            />
          </div>

          {/* Bio / Giới thiệu ngắn */}
          <div className={styles.fullWidth}>
            <label className="form-label" htmlFor="profile-bio">
              Giới thiệu bản thân (Bio)
            </label>
            <textarea
              id="profile-bio"
              className={`${styles.textareaInput} ${errors.bio ? styles.textareaError : ''}`}
              placeholder="Chia sẻ một vài điều ngắn gọn về định hướng hoặc phương châm làm việc..."
              {...register('bio')}
            />
            {errors.bio && (
              <p className={styles.fieldErrorText}>{errors.bio.message}</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
