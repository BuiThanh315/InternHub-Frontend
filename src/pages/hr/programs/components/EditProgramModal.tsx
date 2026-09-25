import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Lock, Edit3, Save } from 'lucide-react';
import type { ProgramDetailResponse, UpdateProgramRequest, DepartmentResponse } from '../../../../types';
import styles from '../styles/ProgramModal.module.css';

interface EditProgramModalProps {
  isOpen: boolean;
  program: ProgramDetailResponse | null;
  departments: DepartmentResponse[];
  onClose: () => void;
  onSubmit: (id: number, formData: UpdateProgramRequest) => Promise<void>;
}

export const EditProgramModal: React.FC<EditProgramModalProps> = ({
  isOpen,
  program,
  departments,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [maxInterns, setMaxInterns] = useState<number>(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (program) {
      setName(program.name || '');
      setDepartmentId(program.departmentId || 1);
      setDescription(program.description || '');
      setMaxInterns(program.maxInterns || 10);
      setStartDate(program.startDate || '');
      setEndDate(program.endDate || '');
      setFormError(null);
      setFieldErrors({});
    }
  }, [program]);

  if (!isOpen || !program) return null;

  // Điểm 4: Nếu chương trình đã ONGOING thì khóa startDate (chỉ cho phép sửa endDate để gia hạn kỳ thực tập)
  const isOngoing = program.status === 'ONGOING';
  const isStartDateLocked = isOngoing;

  // Tính thời lượng
  let durationWeeks = 0;
  let diffDays = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    durationWeeks = Math.max(0, Math.round(diffDays / 7));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Vui lòng nhập tên chương trình thực tập.';
    }
    if (!departmentId) {
      errors.departmentId = 'Vui lòng chọn phòng ban phụ trách.';
    }
    if (!endDate) {
      errors.endDate = 'Vui lòng chọn ngày kết thúc.';
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        errors.endDate = 'Ngày kết thúc phải diễn ra sau ngày bắt đầu.';
      } else if (!program.isHistorical && diffDays < 27) {
        errors.endDate = 'Thời lượng kỳ thực tập tối thiểu phải từ 4 tuần (≥28 ngày) trở lên.';
      }
    }

    // Không cho phép giảm maxInterns nhỏ hơn số intern thực tế đang có
    if (!program.isHistorical && maxInterns < program.currentInterns) {
      errors.maxInterns = `Chỉ tiêu không thể nhỏ hơn số TTS đã duyệt hiện tại (${program.currentInterns} TTS).`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`edit-prog-${firstErrorKey}`);
      if (el) el.focus();
      return;
    }

    setFieldErrors({});

    try {
      setIsSubmitting(true);
      await onSubmit(program.id, {
        name: name.trim(),
        departmentId,
        description: description.trim() || undefined,
        maxInterns,
        startDate: isStartDateLocked ? undefined : startDate,
        endDate,
      });
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Không thể cập nhật chương trình thực tập.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-prog-title">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <Edit3 size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 id="edit-prog-title" className={`${styles.title} text-balance`}>
                Chỉnh Sửa Kỳ Thực Tập
              </h3>
              <p className={styles.subtitle}>
                Mã chương trình: <strong className="font-tabular">{program.programCode}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng cửa sổ chỉnh sửa"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body cuộn độc lập */}
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className={styles.body}>
            {formError && (
              <div className={styles.alertError} role="status" aria-live="polite">
                <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{formError}</span>
              </div>
            )}

            {isOngoing && (
              <div className={styles.lockedNotice}>
                <Lock size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
                <span>
                  Chương trình đang diễn ra (<strong>ONGOING</strong>): Trường <strong>Ngày bắt đầu</strong> đã được hệ thống cố định. Bạn có thể gia hạn <strong>Ngày kết thúc</strong>.
                </span>
              </div>
            )}

            {/* Tên chương trình */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="edit-prog-name" className="form-label">
                Tên chương trình thực tập <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="edit-prog-name"
                type="text"
                className={`form-input ${fieldErrors.name ? 'form-input-error' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                }}
                aria-invalid={Boolean(fieldErrors.name)}
                required
              />
              {fieldErrors.name && (
                <span className="form-error" role="alert">
                  <AlertCircle size={12} aria-hidden="true" /> {fieldErrors.name}
                </span>
              )}
            </div>

            {/* Phòng ban phụ trách */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="edit-prog-departmentId" className="form-label">
                Phòng ban phụ trách <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="edit-prog-departmentId"
                className={`form-select ${fieldErrors.departmentId ? 'form-input-error' : ''}`}
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(Number(e.target.value));
                  if (fieldErrors.departmentId) setFieldErrors((prev) => ({ ...prev, departmentId: '' }));
                }}
                aria-invalid={Boolean(fieldErrors.departmentId)}
                required
              >
                {departments.length === 0 ? (
                  <>
                    <option value="1">Trung tâm Phát triển Phần mềm (IT-DEV)</option>
                    <option value="2">Bộ phận Đảm bảo Chất lượng (QA)</option>
                    <option value="3">Bộ phận An toàn & Bảo mật (SEC)</option>
                    <option value="4">Phòng Nhân sự & Đào tạo (HR-TD)</option>
                  </>
                ) : (
                  departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))
                )}
              </select>
              {fieldErrors.departmentId && (
                <span className="form-error" role="alert">
                  <AlertCircle size={12} aria-hidden="true" /> {fieldErrors.departmentId}
                </span>
              )}
            </div>

            {/* Ngày bắt đầu & Ngày kết thúc */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="edit-prog-startDate" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Ngày bắt đầu</span>
                  {isStartDateLocked && <Lock size={12} aria-hidden="true" style={{ color: 'var(--text-muted)' }} />}
                </label>
                <input
                  id="edit-prog-startDate"
                  type="date"
                  className="form-input font-tabular"
                  value={startDate}
                  disabled={isStartDateLocked}
                  style={isStartDateLocked ? { backgroundColor: 'var(--border-subtle)', cursor: 'not-allowed', opacity: 0.8 } : {}}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="edit-prog-endDate" className="form-label">
                  Ngày kết thúc (gia hạn kỳ) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="edit-prog-endDate"
                  type="date"
                  className={`form-input font-tabular ${fieldErrors.endDate ? 'form-input-error' : ''}`}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (fieldErrors.endDate) setFieldErrors((prev) => ({ ...prev, endDate: '' }));
                  }}
                  aria-invalid={Boolean(fieldErrors.endDate)}
                  required
                />
                {fieldErrors.endDate && (
                  <span className="form-error" role="alert">
                    <AlertCircle size={12} aria-hidden="true" /> {fieldErrors.endDate}
                  </span>
                )}
              </div>
            </div>

            {/* Banner thời lượng trực quan */}
            {startDate && endDate && (
              <div className={styles.durationBanner}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Calendar size={16} aria-hidden="true" />
                  <span>
                    Thời lượng cập nhật: <strong className="font-tabular">{durationWeeks} tuần ({diffDays} ngày)</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Chỉ tiêu tối đa */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="edit-prog-maxInterns" className="form-label">
                Chỉ tiêu tuyển dụng tối đa (max_interns) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="edit-prog-maxInterns"
                type="number"
                min={program.isHistorical ? 0 : (program.currentInterns || 1)}
                max="1000"
                className={`form-input font-tabular ${fieldErrors.maxInterns ? 'form-input-error' : ''}`}
                value={maxInterns}
                onChange={(e) => {
                  setMaxInterns(Number(e.target.value));
                  if (fieldErrors.maxInterns) setFieldErrors((prev) => ({ ...prev, maxInterns: '' }));
                }}
                aria-invalid={Boolean(fieldErrors.maxInterns)}
                required
              />
              {fieldErrors.maxInterns && (
                <span className="form-error" role="alert">
                  <AlertCircle size={12} aria-hidden="true" /> {fieldErrors.maxInterns}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Đang có <strong className="font-tabular">{program.currentInterns}</strong> TTS đã liên kết với chương trình này.
              </span>
            </div>

            {/* Mô tả */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="edit-prog-description" className="form-label">Mô tả kỳ thực tập & Ghi chú</label>
              <textarea
                id="edit-prog-description"
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '150px' }}
            >
              <Save size={16} aria-hidden="true" />
              <span>{isSubmitting ? 'Đang lưu…' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
