import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import {
  updateInternFormSchema,
  type UpdateInternFormValues,
  getAllowedNextStatuses,
} from '../schema';
import type { InternProfile } from '../../../types';

interface InternEditDialogProps {
  isOpen: boolean;
  intern: InternProfile | null;
  onClose: () => void;
  onSubmit: (values: UpdateInternFormValues) => Promise<void>;
}

/**
 * InternEditDialog - Modal chỉnh sửa thông tin thực tập sinh (TM-2)
 * - Tải dữ liệu ban đầu
 * - Dropdown trạng thái áp dụng nghiêm ngặt State Machine của Backend
 * - React Hook Form + Zod validation
 */
export const InternEditDialog: React.FC<InternEditDialogProps> = ({
  isOpen,
  intern,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateInternFormValues>({
    resolver: zodResolver(updateInternFormSchema),
  });

  // Khi mở dialog hoặc chọn intern mới, nạp lại form
  useEffect(() => {
    if (intern && isOpen) {
      reset({
        fullName: intern.fullName,
        email: intern.email,
        phone: intern.phone,
        university: intern.university,
        major: intern.major,
        appliedPosition: intern.appliedPosition || '',
        academicYear: intern.academicYear || '',
        notes: intern.notes || '',
        gpa: intern.gpa,
        department: intern.department || '',
        startDate: intern.startDate ? intern.startDate.substring(0, 10) : '',
        endDate: intern.endDate ? intern.endDate.substring(0, 10) : '',
        status: intern.status,
      });
    }
  }, [intern, isOpen, reset]);

  if (!isOpen || !intern) return null;

  // Lấy danh sách trạng thái kế tiếp hợp lệ
  const allowedStatuses = getAllowedNextStatuses(intern.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface rounded-xl border border-border shadow-pop overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
          <div>
            <h2 className="text-lg font-bold text-text-1 font-heading">
              Chỉnh Sửa Hồ Sơ Thực Tập Sinh
            </h2>
            <p className="text-xs text-text-3 mt-0.5">
              Mã TTS: <span className="font-semibold text-primary">{intern.internCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              await onSubmit(values);
              onClose();
            } catch {
              // Giữ form mở để người dùng xem thông báo lỗi toast từ mutation
            }
          })}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Họ và Tên <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...register('fullName')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.fullName && (
                <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.fullName.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.email && (
                <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.email.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Số Điện Thoại <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                placeholder="0987654321"
                {...register('phone')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.phone && (
                <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.phone.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Trường Đại Học <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...register('university')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.university && (
                <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.university.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Chuyên Ngành <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...register('major')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.major && (
                <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.major.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Vị Trí Ứng Tuyển
              </label>
              <input
                type="text"
                placeholder="VD: Frontend Intern, Backend Intern"
                {...register('appliedPosition')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Điểm GPA (Thang 4.0)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="VD: 3.5"
                {...register('gpa', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.gpa && (
                <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.gpa.message}
                </span>
              )}
            </div>
          </div>

          {/* Trạng thái vòng đời State Machine (TM-2 Core) */}
          <div className="p-3.5 rounded-lg border border-border bg-surface-2/60">
            <label className="block text-xs font-bold text-text-1 mb-1">
              Trạng Thái Hồ Sơ (State Machine)
            </label>
            <p className="text-[11px] text-text-3 mb-2">
              Trạng thái hiện tại: <span className="font-bold text-primary">{intern.status}</span>
            </p>

            {allowedStatuses.length === 0 ? (
              <div className="text-xs text-text-3 italic bg-bg p-2.5 rounded border border-border">
                Hồ sơ đã ở trạng thái kết thúc ({intern.status}), không thể thay đổi trạng thái nữa.
              </div>
            ) : (
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-border text-text-1 focus:outline-none focus:border-primary font-medium"
              >
                <option value={intern.status}>-- Giữ nguyên: {intern.status} --</option>
                {allowedStatuses.map((opt) => (
                  <option key={opt.status} value={opt.status}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {errors.status && (
              <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> Vui lòng chọn trạng thái hợp lệ
              </span>
            )}
          </div>

          {/* Ngày tháng & Phòng ban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Ngày Bắt Đầu <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary"
              />
              {errors.startDate && (
                <span className="text-[11px] text-danger mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.startDate.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Ngày Kết Thúc (Dự kiến)
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1">
              Ghi Chú Đánh Giá / Lưu Ý
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú về tiến trình, kỹ năng hoặc lịch phỏng vấn..."
              {...register('notes')}
              className="w-full px-3 py-2 text-xs rounded-lg bg-bg border border-border text-text-1 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface border border-border text-text-2 hover:bg-surface-2 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
