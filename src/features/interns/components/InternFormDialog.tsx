import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { internFormSchema, type InternFormValues } from '../schema';
import type { CreateInternRequest } from '../../../types';

interface InternFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateInternRequest) => Promise<void>;
  initialData?: Partial<CreateInternRequest>;
  title?: string;
}

/**
 * InternFormDialog - React Hook Form + Zod modal adhering to docs/spec.md section 7:
 * - Validate onBlur + onSubmit
 * - Inline errors below fields using --danger
 * - Loading state with "Đang lưu..." label
 * - Dialog centered with dark overlay rgba(0,0,0,.4)
 */
export const InternFormDialog: React.FC<InternFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Thêm Hồ Sơ Thực Tập Sinh',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<InternFormValues>({
    resolver: zodResolver(internFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      university: initialData?.university || '',
      major: initialData?.major || '',
      gpa: initialData?.gpa || undefined,
      department: initialData?.department || '',
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate || '',
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    if (isDirty) {
      toast.info('Đã hủy bỏ các thay đổi chưa lưu trên biểu mẫu');
    }
    reset();
    onClose();
  };

  const onFormSubmit = async (data: InternFormValues) => {
    try {
      await onSubmit(data as CreateInternRequest);
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-[var(--shadow-pop)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-soft)]">
          <h3 className="text-base font-bold text-[var(--text-1)]">{title}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
              Họ và tên <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                <AlertCircle size={12} /> {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                Email <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="intern@company.com"
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                Số điện thoại <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="0912345678"
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Trường đại học & Chuyên ngành */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                Trường Đại học <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('university')}
                placeholder="ĐH Bách Khoa..."
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {errors.university && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.university.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                Chuyên ngành <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('major')}
                placeholder="CNTT, KTPM..."
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {errors.major && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.major.message}
                </p>
              )}
            </div>
          </div>

          {/* Vị trí ứng tuyển & Ngày bắt đầu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                Vị trí thực tập <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('appliedPosition')}
                placeholder="Backend Java, Frontend React..."
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {errors.appliedPosition && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.appliedPosition.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                Ngày bắt đầu <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.startDate.message}
                </p>
              )}
            </div>
          </div>

          {/* GPA & Phòng ban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                GPA (Thang 4.0)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('gpa', { valueAsNumber: true })}
                placeholder="3.5"
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {errors.gpa && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.gpa.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                Phòng ban tiếp nhận
              </label>
              <input
                type="text"
                {...register('department')}
                placeholder="Kỹ thuật phần mềm..."
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-soft)]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? 'Đang lưu…' : 'Xác Nhận Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
