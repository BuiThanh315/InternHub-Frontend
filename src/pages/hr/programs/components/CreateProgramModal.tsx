import React, { useState } from 'react';
import { X, AlertCircle, FolderPlus, Clock, Sparkles } from 'lucide-react';
import type { CreateProgramRequest, DepartmentResponse } from '../../../../types';
import styles from '../styles/ProgramModal.module.css';

interface CreateProgramModalProps {
  isOpen: boolean;
  departments: DepartmentResponse[];
  onClose: () => void;
  onSubmit: (formData: CreateProgramRequest) => Promise<void>;
}

export const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  isOpen,
  departments,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(departments[0]?.id || 1);
  const [description, setDescription] = useState('');
  const [maxInterns, setMaxInterns] = useState<number>(10);
  const [currentInterns, setCurrentInterns] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHistorical, setIsHistorical] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Tự động chọn phòng ban đầu tiên khi danh sách departments được nạp hoặc modal được mở
  React.useEffect(() => {
    if (isOpen) {
      if (departments.length > 0) {
        setDepartmentId(departments[0].id);
      } else {
        setDepartmentId(1);
      }
      setFieldErrors({});
      setFormError(null);
    }
  }, [isOpen, departments]);

  if (!isOpen) return null;

  // Tính số tuần thực tế giữa startDate và endDate
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
    if (!startDate) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu kỳ.';
    }
    if (!endDate) {
      errors.endDate = 'Vui lòng chọn ngày kết thúc kỳ.';
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        errors.endDate = 'Ngày kết thúc phải diễn ra sau ngày bắt đầu.';
      } else if (!isHistorical && diffDays < 27) {
        errors.endDate = 'Thời lượng kỳ thực tập tối thiểu phải từ 4 tuần (≥28 ngày) trở lên.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Auto focus vào trường lỗi đầu tiên theo Web Interface Guidelines
      const firstErrorField = Object.keys(errors)[0];
      const el = document.getElementById(`create-prog-${firstErrorField}`);
      if (el) el.focus();
      return;
    }

    setFieldErrors({});

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        departmentId,
        description: description.trim() || undefined,
        maxInterns: isHistorical ? (maxInterns || 0) : maxInterns,
        currentInterns: isHistorical ? currentInterns : undefined,
        startDate,
        endDate,
        isHistorical,
      });
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Không thể tạo chương trình thực tập.');
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
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-prog-title">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <FolderPlus size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 id="create-prog-title" className={`${styles.title} text-balance`}>
                Thiết Lập Kỳ Thực Tập Mới
              </h3>
              <p className={styles.subtitle}>
                Quy định phòng ban, chỉ tiêu tiếp nhận và thời hạn bắt đầu/kết thúc
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng cửa sổ tạo chương trình"
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

            {/* Toggle Lưu trữ lịch sử - Clickable Card theo chuẩn HTML Label */}
            <label
              htmlFor="create-prog-isHistorical"
              className={`${styles.historicalCard} ${isHistorical ? styles.historicalCardActive : ''}`}
            >
              <div>
                <p className={styles.historicalCardTitle}>Chương trình thực tập lưu trữ (Lịch sử)</p>
                <p className={styles.historicalCardDesc}>
                  Bật tùy chọn này để bổ sung dữ liệu các kỳ thực tập đã hoàn thành trong quá khứ.
                </p>
              </div>
              <input
                id="create-prog-isHistorical"
                type="checkbox"
                checked={isHistorical}
                onChange={(e) => setIsHistorical(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </label>

            {/* Tên chương trình */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="create-prog-name" className="form-label">
                Tên chương trình thực tập <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="create-prog-name"
                type="text"
                className={`form-input ${fieldErrors.name ? 'form-input-error' : ''}`}
                placeholder="Ví dụ: Chương trình TTS Kỹ Thuật Công Nghệ Mùa Hè 2026…"
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
              <label htmlFor="create-prog-departmentId" className="form-label">
                Phòng ban phụ trách <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="create-prog-departmentId"
                className={`form-select ${fieldErrors.departmentId ? 'form-input-error' : ''}`}
                value={departmentId || ''}
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

            {/* Ngày bắt đầu & kết thúc */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="create-prog-startDate" className="form-label">
                  Ngày bắt đầu kỳ <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="create-prog-startDate"
                  type="date"
                  className={`form-input font-tabular ${fieldErrors.startDate ? 'form-input-error' : ''}`}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (fieldErrors.startDate) setFieldErrors((prev) => ({ ...prev, startDate: '' }));
                  }}
                  aria-invalid={Boolean(fieldErrors.startDate)}
                  required
                />
                {fieldErrors.startDate && (
                  <span className="form-error" role="alert">
                    <AlertCircle size={12} aria-hidden="true" /> {fieldErrors.startDate}
                  </span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="create-prog-endDate" className="form-label">
                  Ngày kết thúc (ngày cuối) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="create-prog-endDate"
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
              <div className={`${styles.durationBanner} ${!isHistorical && diffDays < 27 ? styles.durationBannerWarning : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Clock size={16} aria-hidden="true" />
                  <span>
                    Thời lượng ước tính: <strong className="font-tabular">{durationWeeks} tuần ({diffDays} ngày)</strong>
                  </span>
                </div>
                {!isHistorical && diffDays < 27 && (
                  <span style={{ fontSize: '0.75rem' }}>⚠️ Cần tối thiểu 4 tuần (≥28 ngày)</span>
                )}
              </div>
            )}

            {/* Chỉ tiêu tuyển dụng */}
            <div style={{ display: 'grid', gridTemplateColumns: isHistorical ? '1fr 1fr' : '1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="create-prog-maxInterns" className="form-label">
                  Chỉ tiêu tiếp nhận tối đa (max_interns) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="create-prog-maxInterns"
                  type="number"
                  min="1"
                  max="1000"
                  className="form-input font-tabular"
                  value={maxInterns}
                  onChange={(e) => setMaxInterns(Number(e.target.value))}
                  required
                />
              </div>

              {isHistorical && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="create-prog-currentInterns" className="form-label">
                    Số TTS thực tế đã tốt nghiệp
                  </label>
                  <input
                    id="create-prog-currentInterns"
                    type="number"
                    min="0"
                    max="1000"
                    className="form-input font-tabular"
                    value={currentInterns}
                    onChange={(e) => setCurrentInterns(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* Mô tả chương trình */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="create-prog-description" className="form-label">
                Mô tả kỳ thực tập & Mục tiêu đào tạo
              </label>
              <textarea
                id="create-prog-description"
                className="form-textarea"
                rows={3}
                placeholder="VD: Kỳ thực tập hướng đến sinh viên năm 3–4 chuyên ngành CNTT…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Sticky Footer */}
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
              style={{ minWidth: '160px' }}
            >
              <Sparkles size={16} aria-hidden="true" />
              <span>{isSubmitting ? 'Đang tạo…' : 'Tạo Chương Trình'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
