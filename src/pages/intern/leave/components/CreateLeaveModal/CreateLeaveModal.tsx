import React, { useState, useEffect, useMemo } from 'react';
import { CalendarPlus, Info, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../../../../components/common';
import { calculateWorkingDays } from '../../../../../services/leaveService';
import type { CreateLeaveModalProps } from './CreateLeaveModal.types';
import type { LeaveType, LeaveDurationType, CreateLeaveRequest } from '../../../../../types';
import styles from './CreateLeaveModal.module.css';

const LEAVE_TYPES: { value: LeaveType; label: string; desc: string }[] = [
  { value: 'SICK', label: 'Nghỉ ốm đau / Khám bệnh', desc: 'Có giấy khám bệnh hoặc đơn thuốc' },
  { value: 'PERSONAL', label: 'Nghỉ việc riêng cá nhân', desc: 'Giải quyết việc cá nhân đột xuất' },
  { value: 'ACADEMIC_EXAM', label: 'Nghỉ thi cử / Đồ án tốt nghiệp', desc: 'Lịch thi, bảo vệ đồ án tại trường' },
  { value: 'BEREAVEMENT', label: 'Nghỉ việc gia đình / Tang lễ', desc: 'Hiếu hỉ gia đình' },
  { value: 'OTHER', label: 'Lý do chính đáng khác', desc: 'Nêu rõ lý do trong phần mô tả' },
];

export const CreateLeaveModal: React.FC<CreateLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [form, setForm] = useState<{
    leaveType: LeaveType;
    durationType: LeaveDurationType;
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl: string;
  }>({
    leaveType: 'ACADEMIC_EXAM',
    durationType: 'FULL_DAY',
    startDate: tomorrowStr,
    endDate: tomorrowStr,
    reason: '',
    attachmentUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Reset form khi modal mở ra
  useEffect(() => {
    if (isOpen) {
      setForm({
        leaveType: 'ACADEMIC_EXAM',
        durationType: 'FULL_DAY',
        startDate: tomorrowStr,
        endDate: tomorrowStr,
        reason: '',
        attachmentUrl: '',
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [isOpen, tomorrowStr]);

  // Khi chuyển sang nghỉ nửa ngày: tự động khóa endDate = startDate
  const handleDurationChange = (type: LeaveDurationType) => {
    setIsDirty(true);
    if (type === 'MORNING' || type === 'AFTERNOON') {
      setForm((prev) => ({
        ...prev,
        durationType: type,
        endDate: prev.startDate,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        durationType: type,
      }));
    }
  };

  const handleStartDateChange = (val: string) => {
    setIsDirty(true);
    setForm((prev) => {
      const isHalfDay = prev.durationType === 'MORNING' || prev.durationType === 'AFTERNOON';
      return {
        ...prev,
        startDate: val,
        endDate: isHalfDay || prev.endDate < val ? val : prev.endDate,
      };
    });
    if (errors.startDate || errors.endDate) {
      setErrors((prev) => ({ ...prev, startDate: '', endDate: '' }));
    }
  };

  const handleEndDateChange = (val: string) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, endDate: val }));
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: '' }));
    }
  };

  // Tính số ngày làm việc thực tế xem trước
  const workingDays = useMemo(() => {
    return calculateWorkingDays(form.startDate, form.endDate, form.durationType);
  }, [form.startDate, form.endDate, form.durationType]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.startDate) {
      errs.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    if (!form.endDate) {
      errs.endDate = 'Vui lòng chọn ngày kết thúc';
    } else if (form.startDate && form.endDate < form.startDate) {
      errs.endDate = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu';
    }

    if (!form.reason.trim()) {
      errs.reason = 'Lý do xin nghỉ không được để trống';
    } else if (form.reason.trim().length < 10) {
      errs.reason = 'Lý do xin nghỉ phải có ít nhất 10 ký tự';
    } else if (form.reason.trim().length > 500) {
      errs.reason = 'Lý do xin nghỉ không được vượt quá 500 ký tự';
    }

    if (form.attachmentUrl.trim().length > 500) {
      errs.attachmentUrl = 'Link đính kèm không được vượt quá 500 ký tự';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateLeaveRequest = {
      leaveType: form.leaveType,
      durationType: form.durationType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
      attachmentUrl: form.attachmentUrl.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop={!isDirty && !isSubmitting}
      size="lg"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <CalendarPlus size={22} style={{ color: 'var(--primary)' }} />
          <span>Tạo Đơn Xin Nghỉ Phép Mới</span>
        </div>
      }
      footer={
        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy Bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || workingDays === 0}
          >
            {isSubmitting ? (
              'Đang gửi đơn...'
            ) : (
              <>
                <Send size={15} style={{ marginRight: 6 }} />
                Gửi Đơn Xin Nghỉ
              </>
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={styles.modalBody}>
        {/* Hộp lưu ý chính sách */}
        <div className={styles.noticeBox}>
          <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
          <div>
            Đơn xin nghỉ phép cần được gửi trước ngày nghỉ dự kiến. Hệ thống tự động
            loại trừ Thứ Bảy và Chủ Nhật khi tính toán ngày công.
          </div>
        </div>

        {/* 1. Loại nghỉ phép */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="leaveTypeSelect">
            <span>
              Loại Nghỉ Phép<span className={styles.required}>*</span>
            </span>
          </label>
          <select
            id="leaveTypeSelect"
            className={styles.selectControl}
            value={form.leaveType}
            onChange={(e) => {
              setIsDirty(true);
              setForm((prev) => ({ ...prev, leaveType: e.target.value as LeaveType }));
            }}
          >
            {LEAVE_TYPES.map((lt) => (
              <option key={lt.value} value={lt.value}>
                {lt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Khung thời gian */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span>
              Khung Thời Gian Nghỉ<span className={styles.required}>*</span>
            </span>
          </label>
          <div className={styles.radioGroup}>
            <div
              className={`${styles.radioOption} ${
                form.durationType === 'FULL_DAY' ? styles.radioOptionActive : ''
              }`}
              onClick={() => handleDurationChange('FULL_DAY')}
            >
              <input
                type="radio"
                name="durationType"
                checked={form.durationType === 'FULL_DAY'}
                onChange={() => handleDurationChange('FULL_DAY')}
              />
              <span>Cả ngày</span>
            </div>

            <div
              className={`${styles.radioOption} ${
                form.durationType === 'MORNING' ? styles.radioOptionActive : ''
              }`}
              onClick={() => handleDurationChange('MORNING')}
            >
              <input
                type="radio"
                name="durationType"
                checked={form.durationType === 'MORNING'}
                onChange={() => handleDurationChange('MORNING')}
              />
              <span>Buổi sáng (08h - 12h)</span>
            </div>

            <div
              className={`${styles.radioOption} ${
                form.durationType === 'AFTERNOON' ? styles.radioOptionActive : ''
              }`}
              onClick={() => handleDurationChange('AFTERNOON')}
            >
              <input
                type="radio"
                name="durationType"
                checked={form.durationType === 'AFTERNOON'}
                onChange={() => handleDurationChange('AFTERNOON')}
              />
              <span>Buổi chiều (13h30 - 17h30)</span>
            </div>
          </div>
        </div>

        {/* 3. Khoảng ngày bắt đầu & kết thúc */}
        <div className={styles.dateGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="startDateInput">
              <span>
                Ngày Bắt Đầu<span className={styles.required}>*</span>
              </span>
            </label>
            <input
              id="startDateInput"
              type="date"
              className={`${styles.inputControl} ${errors.startDate ? styles.inputError : ''}`}
              value={form.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
            {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="endDateInput">
              <span>
                Ngày Kết Thúc<span className={styles.required}>*</span>
              </span>
            </label>
            <input
              id="endDateInput"
              type="date"
              className={`${styles.inputControl} ${errors.endDate ? styles.inputError : ''}`}
              value={form.endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              disabled={form.durationType === 'MORNING' || form.durationType === 'AFTERNOON'}
            />
            {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
          </div>
        </div>

        {/* 4. Live Preview số ngày công */}
        {workingDays > 0 ? (
          <div className={styles.previewBadge}>
            <CheckCircle2 size={18} />
            <span>
              Dự kiến xin nghỉ: <strong>{workingDays.toFixed(1)} ngày công</strong> (Đã loại trừ
              Thứ 7 & Chủ Nhật)
            </span>
          </div>
        ) : (
          <div className={`${styles.previewBadge} ${styles.previewWarning}`}>
            <AlertTriangle size={18} />
            <span>
              Khoảng thời gian bạn chọn rơi vào cuối tuần hoặc chưa hợp lệ (0 ngày công).
            </span>
          </div>
        )}

        {/* 5. Lý do xin nghỉ */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="reasonTextarea">
            <span>
              Lý Do Xin Nghỉ<span className={styles.required}>*</span>
            </span>
            <span
              className={`${styles.counter} ${
                form.reason.length > 500 ? styles.counterLimit : ''
              }`}
            >
              {form.reason.length} / 500 ký tự (Tối thiểu 10)
            </span>
          </label>
          <textarea
            id="reasonTextarea"
            className={`${styles.textareaControl} ${errors.reason ? styles.inputError : ''}`}
            placeholder="Nêu rõ lý do bạn xin nghỉ phép để Mentor dễ dàng xem xét và phê duyệt..."
            value={form.reason}
            onChange={(e) => {
              setIsDirty(true);
              setForm((prev) => ({ ...prev, reason: e.target.value }));
              if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
            }}
          />
          {errors.reason && <span className={styles.errorText}>{errors.reason}</span>}
        </div>

        {/* 6. Link tài liệu minh chứng */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="attachmentInput">
            <span>Link Tài Liệu / Minh Chứng (Tùy chọn)</span>
          </label>
          <input
            id="attachmentInput"
            type="url"
            className={`${styles.inputControl} ${
              errors.attachmentUrl ? styles.inputError : ''
            }`}
            placeholder="https://drive.google.com/... (ảnh đơn thuốc, lịch thi...)"
            value={form.attachmentUrl}
            onChange={(e) => {
              setIsDirty(true);
              setForm((prev) => ({ ...prev, attachmentUrl: e.target.value }));
            }}
          />
          {errors.attachmentUrl && (
            <span className={styles.errorText}>{errors.attachmentUrl}</span>
          )}
        </div>
      </form>
    </Modal>
  );
};
